use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Metadata {
    pub source_id: Option<String>,
    pub category: Option<String>,
    pub timestamp: Option<DateTime<Utc>>,
    pub tags: Vec<String>,
    pub custom: HashMap<String, serde_json::Value>,
}