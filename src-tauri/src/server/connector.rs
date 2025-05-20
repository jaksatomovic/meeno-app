use crate::common::connector::Connector;
use crate::common::search::parse_search_results;
use crate::server::http_client::HttpClient;
use crate::server::servers::get_all_servers;
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use tauri::{AppHandle, Runtime};

lazy_static! {
    static ref CONNECTOR_CACHE: Arc<RwLock<HashMap<String, HashMap<String, Connector>>>> =
        Arc::new(RwLock::new(HashMap::new()));
}

pub fn save_connectors_to_cache(server_id: &str, connectors: Vec<Connector>) {
    let mut cache = CONNECTOR_CACHE.write().unwrap(); // Acquire write lock
    let connectors_map: HashMap<String, Connector> = connectors
        .into_iter()
        .map(|connector| (connector.id.clone(), connector))
        .collect();
    cache.insert(server_id.to_string(), connectors_map);
}

pub fn get_connector_by_id(server_id: &str, connector_id: &str) -> Option<Connector> {
    let cache = CONNECTOR_CACHE.read().unwrap(); // Async read lock
    let server_cache = cache.get(server_id)?;
    let connector = server_cache.get(connector_id)?;
    Some(connector.clone())
}

pub async fn refresh_all_connectors<R: Runtime>(app_handle: &AppHandle<R>) -> Result<(), String> {
    let servers = get_all_servers();

    // Collect all the tasks for fetching and refreshing connectors
    let mut server_map = HashMap::new();
    for server in servers {
        if !server.enabled {
            continue;
        }

        // dbg!("start fetch connectors for server: {}", &server.id);
        let connectors = match get_connectors_by_server(app_handle.clone(), server.id.clone()).await
        {
            Ok(connectors) => {
                let connectors_map: HashMap<String, Connector> = connectors
                    .into_iter()
                    .map(|connector| (connector.id.clone(), connector))
                    .collect();
                connectors_map
            }
            Err(_e) => {
                HashMap::new() // Return empty map on failure
            }
        };

        server_map.insert(server.id.clone(), connectors);
    }

    // After all tasks have finished, perform a read operation on the cache
    let _cache_size = {
        // Insert connectors into the cache (async write lock)
        let mut cache = CONNECTOR_CACHE.write().unwrap(); // Async write lock
        cache.clear();
        cache.extend(server_map);
        // let cache = CONNECTOR_CACHE.read().await; // Async read lock
        cache.len()
    };

    Ok(())
}

#[allow(dead_code)]
pub async fn get_connectors_from_cache_or_remote(
    server_id: &str,
) -> Result<Vec<Connector>, String> {
    // Acquire the read lock and check cache for connectors
    let cache = CONNECTOR_CACHE.read().unwrap(); // Acquire read lock
    if let Some(connectors) = cache.get(server_id).cloned() {
        return Ok(connectors.values().cloned().collect());
    }

    // Drop the read lock before performing async operations
    drop(cache);

    // If the cache is empty, fetch connectors from the remote server
    let connectors = fetch_connectors_by_server(server_id).await?;

    // Convert the Vec<Connector> into HashMap<String, Connector>
    let connectors_map: HashMap<String, Connector> = connectors
        .clone()
        .into_iter()
        .map(|connector| (connector.id.clone(), connector)) // Assuming Connector has an `id` field
        .collect();

    // Optionally, update the cache after fetching data from remote
    let mut cache = CONNECTOR_CACHE.write().unwrap(); // Acquire write lock
    cache.insert(server_id.to_string(), connectors_map.clone());

    Ok(connectors)
}

pub async fn fetch_connectors_by_server(id: &str) -> Result<Vec<Connector>, String> {
    // Use the generic GET method from HttpClient
    let resp = HttpClient::get(&id, "/connector/_search", None)
        .await
        .map_err(|e| {
            // dbg!("Error fetching connector for id {}: {}", &id, &e);
            format!("Error fetching connector: {}", e)
        })?;

    // Parse the search results directly from the response body
    let datasource: Vec<Connector> = parse_search_results(resp)
        .await
        .map_err(|e| e.to_string())?;

    // Save the connectors to the cache
    save_connectors_to_cache(&id, datasource.clone());

    Ok(datasource)
}

#[tauri::command]
pub async fn get_connectors_by_server<R: Runtime>(
    _app_handle: AppHandle<R>,
    id: String,
) -> Result<Vec<Connector>, String> {
    let connectors = fetch_connectors_by_server(&id).await?;
    Ok(connectors)
}
