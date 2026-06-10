use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpsertVector {
    pub id: Option<Uuid>,
    pub values: Vec<f32>,
    pub metadata: Option<super::Metadata>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SearchQuery {
    pub vector: Vec<f32>,
    pub limit: Option<usize>,
    pub filters: Option<SearchFilters>,
    pub hybrid_alpha: Option<f32>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SearchFilters {
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub source_id: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SearchResult {
    pub id: Uuid,
    pub score: f32,
    pub vector: Vec<f32>,
    pub metadata: super::Metadata,
    pub trace: Option<QueryTrace>,
}