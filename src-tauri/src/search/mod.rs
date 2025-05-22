use crate::common::error::SearchError;
use crate::common::register::SearchSourceRegistry;
use crate::common::search::{
    FailedRequest, MultiSourceQueryResponse, QueryHits, QuerySource, SearchQuery,
};
use futures::stream::FuturesUnordered;
use futures::StreamExt;
use std::collections::HashMap;
use std::collections::HashSet;
use tauri::{AppHandle, Manager, Runtime};
use tokio::time::{timeout, Duration};

#[tauri::command]
pub async fn query_coco_fusion<R: Runtime>(
    app_handle: AppHandle<R>,
    from: u64,
    size: u64,
    query_strings: HashMap<String, String>,
    query_timeout: u64,
) -> Result<MultiSourceQueryResponse, SearchError> {
    let query_source_to_search = query_strings.get("querysource");

    let search_sources = app_handle.state::<SearchSourceRegistry>();

    let sources_future = search_sources.get_sources();
    let mut futures = FuturesUnordered::new();
    let mut sources = HashMap::new();

    let sources_list = sources_future.await;

    // Time limit for each query
    let timeout_duration = Duration::from_millis(query_timeout);

    // Push all queries into futures
    for query_source in sources_list {
        let query_source_type = query_source.get_type().clone();

        if let Some(query_source_to_search) = query_source_to_search {
            // We should not search this data source
            if &query_source_type.id != query_source_to_search {
                continue;
            }
        }

        sources.insert(query_source_type.id.clone(), query_source_type);

        let query = SearchQuery::new(from, size, query_strings.clone());
        let query_source_clone = query_source.clone(); // Clone Arc to avoid ownership issues

        futures.push(tokio::spawn(async move {
            // Timeout each query execution
            timeout(timeout_duration, async {
                query_source_clone.search(query).await
            })
            .await
        }));
    }

    let mut total_hits = 0;
    let mut failed_requests = Vec::new();
    let mut all_hits: Vec<(String, QueryHits, f64)> = Vec::new();
    let mut hits_per_source: HashMap<String, Vec<(QueryHits, f64)>> = HashMap::new();

    while let Some(result) = futures.next().await {
        match result {
            Ok(Ok(Ok(response))) => {
                total_hits += response.total_hits;
                let source_id = response.source.id.clone();

                for (doc, score) in response.hits {
                    let query_hit = QueryHits {
                        source: Some(response.source.clone()),
                        score,
                        document: doc,
                    };

                    all_hits.push((source_id.clone(), query_hit.clone(), score));

                    hits_per_source
                        .entry(source_id.clone())
                        .or_insert_with(Vec::new)
                        .push((query_hit, score));
                }
            }
            Ok(Ok(Err(err))) => {
                failed_requests.push(FailedRequest {
                    source: QuerySource {
                        r#type: "N/A".into(),
                        name: "N/A".into(),
                        id: "N/A".into(),
                    },
                    status: 0,
                    error: Some(err.to_string()),
                    reason: None,
                });
            }
            Ok(Err(err)) => {
                failed_requests.push(FailedRequest {
                    source: QuerySource {
                        r#type: "N/A".into(),
                        name: "N/A".into(),
                        id: "N/A".into(),
                    },
                    status: 0,
                    error: Some(err.to_string()),
                    reason: None,
                });
            }
            // Timeout reached, skip this request
            _ => {
                failed_requests.push(FailedRequest {
                    source: QuerySource {
                        r#type: "N/A".into(),
                        name: "N/A".into(),
                        id: "N/A".into(),
                    },
                    status: 0,
                    error: Some(format!("{:?}", &result)),
                    reason: None,
                });
            }
        }
    }

    // Sort hits within each source by score (descending)
    for hits in hits_per_source.values_mut() {
        hits.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    }

    let total_sources = hits_per_source.len();
    let max_hits_per_source = if total_sources > 0 {
        size as usize / total_sources
    } else {
        size as usize
    };

    let mut final_hits = Vec::new();
    let mut seen_docs = HashSet::new(); // To track documents we've already added

    // Distribute hits fairly across sources
    for (_source_id, hits) in &mut hits_per_source {
        let take_count = hits.len().min(max_hits_per_source);
        for (doc, _) in hits.drain(0..take_count) {
            if !seen_docs.contains(&doc.document.id) {
                seen_docs.insert(doc.document.id.clone());
                final_hits.push(doc);
            }
        }
    }

    // If we still need more hits, take the highest-scoring remaining ones
    if final_hits.len() < size as usize {
        let remaining_needed = size as usize - final_hits.len();

        // Sort all hits by score descending, removing duplicates by document ID
        all_hits.sort_by(|a, b| b.2.partial_cmp(&a.2).unwrap_or(std::cmp::Ordering::Equal));

        let extra_hits = all_hits
            .into_iter()
            .filter(|(source_id, _, _)| hits_per_source.contains_key(source_id)) // Only take from known sources
            .filter_map(|(_, doc, _)| {
                if !seen_docs.contains(&doc.document.id) {
                    seen_docs.insert(doc.document.id.clone());
                    Some(doc)
                } else {
                    None
                }
            })
            .take(remaining_needed)
            .collect::<Vec<_>>();

        final_hits.extend(extra_hits);
    }

    // **Sort final hits by score descending**
    final_hits.sort_by(|a, b| {
        b.score
            .partial_cmp(&a.score)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    Ok(MultiSourceQueryResponse {
        failed: failed_requests,
        hits: final_hits,
        total_hits,
    })
}
