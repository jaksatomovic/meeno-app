use serde::Serialize;

#[cfg(feature = "use_pizza_engine")]
mod with_feature;

#[cfg(not(feature = "use_pizza_engine"))]
mod without_feature;

#[cfg(feature = "use_pizza_engine")]
pub use with_feature::*;

#[cfg(not(feature = "use_pizza_engine"))]
pub use without_feature::*;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppEntry {
    path: String,
    name: String,
    icon_path: String,
    alias: String,
    hotkey: String,
    is_disabled: bool,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppMetadata {
    name: String,
    r#where: String,
    size: u64,
    icon: String,
    created: u128,
    modified: u128,
    last_opened: u128,
}
