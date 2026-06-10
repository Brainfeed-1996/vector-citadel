use serde::{Deserialize, Serialize};
use uuid::Uuid;
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vector {
    pub id: Uuid,
    pub values: Vec<f32>,
    pub metadata: Metadata,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub ttl: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpsertVector {
    pub id: Option<Uuid>,
    pub values: Vec<f32>,
    pub metadata: Option<Metadata>,
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
    pub metadata: Metadata,
    pub trace: Option<QueryTrace>,
    pub freshness_score: Option<f32>,
    pub scoring_breakdown: Option<ScoringBreakdown>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryTrace {
    pub steps: Vec<TraceStep>,
    pub total_latency_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceStep {
    pub name: String,
    pub latency_ms: u64,
    pub details: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoringBreakdown {
    pub vector_score: f32,
    pub metadata_score: f32,
    pub final_score: f32,
    pub explanation: String,
}