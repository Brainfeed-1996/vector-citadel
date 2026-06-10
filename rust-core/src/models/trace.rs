use serde::{Deserialize, Serialize};

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