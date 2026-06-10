use std::sync::Arc;
use dashmap::DashMap;
use hnsw::Hnsw;
use serde_json;
use uuid::Uuid;
use chrono::Utc;
use crate::models::{Vector, UpsertVector, SearchQuery, SearchResult, QueryTrace, TraceStep, ScoringBreakdown, Metadata};

pub struct VectorIndexService {
    index: Arc<DashMap<Uuid, Vector>>,
    hnsw_index: Arc<Hnsw>,
}

impl VectorIndexService {
    pub fn new() -> Self {
        Self {
            index: Arc::new(DashMap::new()),
            hnsw_index: Arc::new(Hnsw::new(1536, 10, 256)),
        }
    }

    pub fn upsert(&self, vector: UpsertVector) -> Result<Vector, String> {
        let now = Utc::now();
        let id = vector.id.unwrap_or_else(|| Uuid::new_v4());
        
        let v = Vector {
            id,
            values: vector.values.clone(),
            metadata: vector.metadata.unwrap_or_default(),
            created_at: now,
            updated_at: now,
        };
        
        self.index.insert(id, v.clone());
        Ok(v)
    }

    pub fn search(&self, query: SearchQuery) -> Vec<SearchResult> {
        let limit = query.limit.unwrap_or(10);
        let mut results = Vec::new();
        
        for entry in self.index.iter().take(limit) {
            let (_, vector) = entry;
            let score = self.cosine_similarity(&query.vector, &vector.values);
            
            results.push(SearchResult {
                id: vector.id,
                score,
                vector: vector.values.clone(),
                metadata: vector.metadata.clone(),
                trace: None,
            });
        }
        
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        results.truncate(limit);
        results
    }

    fn cosine_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        if a.len() != b.len() {
            return 0.0;
        }
        
        let dot_product: f32 = a.iter().zip(b).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
        
        if norm_a == 0.0 || norm_b == 0.0 {
            0.0
        } else {
            dot_product / (norm_a * norm_b)
        }
    }
}