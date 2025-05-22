use crate::common::document::Document;
use crate::common::error::SearchError;
use crate::common::http::get_response_body_text;
use crate::common::search::{QueryHits, QueryResponse, QuerySource, SearchQuery, SearchResponse};
use crate::common::server::Server;
use crate::common::traits::SearchSource;
use crate::server::http_client::HttpClient;
use async_trait::async_trait;
// use futures::stream::StreamExt;
use ordered_float::OrderedFloat;
use std::collections::HashMap;
use tauri_plugin_store::JsonValue;
// use std::hash::Hash;

#[allow(dead_code)]
pub(crate) struct DocumentsSizedCollector {
    size: u64,
    /// Documents and scores
    ///
    /// Sorted by score, in descending order. (Server ID, Document, Score)
    docs: Vec<(String, Document, OrderedFloat<f64>)>,
}

#[allow(dead_code)]
impl DocumentsSizedCollector {
    pub(crate) fn new(size: u64) -> Self {
        // there will be size + 1 documents in docs at max
        let docs = Vec::with_capacity((size + 1) as usize);

        Self { size, docs }
    }

    pub(crate) fn push(&mut self, source: String, item: Document, score: f64) {
        let score = OrderedFloat(score);
        let insert_idx = match self.docs.binary_search_by(|(_, _, s)| score.cmp(s)) {
            Ok(idx) => idx,
            Err(idx) => idx,
        };

        self.docs.insert(insert_idx, (source, item, score));

        // Ensure we do not exceed `size`
        if self.docs.len() as u64 > self.size {
            self.docs.truncate(self.size as usize);
        }
    }

    fn documents(self) -> impl ExactSizeIterator<Item = Document> {
        self.docs.into_iter().map(|(_, doc, _)| doc)
    }

    // New function to return documents grouped by server_id
    pub(crate) fn documents_with_sources(self, x: &HashMap<String, QuerySource>) -> Vec<QueryHits> {
        let mut grouped_docs: Vec<QueryHits> = Vec::new();

        for (source_id, doc, score) in self.docs.into_iter() {
            // Try to get the source from the hashmap
            let source = x.get(&source_id).cloned();

            // Push the document and source into the result
            grouped_docs.push(QueryHits {
                source,
                score: score.into_inner(),
                document: doc,
            });
        }

        grouped_docs
    }
}

const COCO_SERVERS: &str = "coco-servers";

pub struct CocoSearchSource {
    server: Server,
}

impl CocoSearchSource {
    pub fn new(server: Server) -> Self {
        CocoSearchSource { server }
    }
}

#[async_trait]
impl SearchSource for CocoSearchSource {
    fn get_type(&self) -> QuerySource {
        QuerySource {
            r#type: COCO_SERVERS.into(),
            name: self.server.name.clone(),
            id: self.server.id.clone(),
        }
    }

    async fn search(&self, query: SearchQuery) -> Result<QueryResponse, SearchError> {
        let url = "/query/_search";

        let mut query_args: HashMap<String, JsonValue> = HashMap::new();
        query_args.insert("from".into(), JsonValue::Number(query.from.into()));
        query_args.insert("size".into(), JsonValue::Number(query.size.into()));
        for (key, value) in query.query_strings {
            query_args.insert(key, JsonValue::String(value));
        }

        let response = HttpClient::get(&self.server.id, &url, Some(query_args))
            .await
            .map_err(|e| SearchError::HttpError(format!("Error to send search request: {}", e)))?;

        // Use the helper function to parse the response body
        let response_body = get_response_body_text(response)
            .await
            .map_err(|e| SearchError::ParseError(format!("Failed to read response body: {}", e)))?;

        // Parse the search response from the body text
        let parsed: SearchResponse<Document> =
            serde_json::from_str(&response_body).map_err(|e| {
                SearchError::ParseError(format!("Failed to parse search response: {}", e))
            })?;

        // Process the parsed response
        let total_hits = parsed.hits.total.value as usize;
        let hits: Vec<(Document, f64)> = parsed
            .hits
            .hits
            .into_iter()
            .map(|hit| (hit._source, hit._score.unwrap_or(0.0))) // Default _score to 0.0 if None
            .collect();

        // Return the final result
        Ok(QueryResponse {
            source: self.get_type(),
            hits,
            total_hits,
        })
    }
}
