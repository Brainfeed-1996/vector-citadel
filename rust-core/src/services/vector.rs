use std::sync::Arc;
use dashmap::DashMap;
use uuid::Uuid;
use chrono::Utc;
use crate::models::{Vector, UpsertVector, SearchQuery, SearchResult, QueryTrace, ScoringBreakdown};

pub struct VectorIndexService {
    index: Arc<DashMap<Uuid, Vector>>,
}

impl VectorIndexService {
    pub fn new() -> Self {
        Self {
            index: Arc::new(DashMap::new()),
        }
    }

    pub fn upsert(&self, vector: UpsertVector) -> Vector {
        let now = Utc::now();
        let id = vector.id.unwrap_or_else(|| Uuid::new_v4());
        
        let v = Vector {
            id,
            values: vector.values.clone(),
            metadata: vector.metadata.clone().unwrap_or_default(),
            created_at: now,
            updated_at: now,
            ttl: None,
        };
        
        self.index.insert(id, v.clone());
        v
    }

    pub fn search(&self, query: SearchQuery) -> Vec<SearchResult> {
        let limit = query.limit.unwrap_or(10);
        let hybrid_alpha = query.hybrid_alpha.unwrap_or(0.7);
        let mut results = Vec::new();
        
        for entry in self.index.iter() {
            let (_, vector) = entry;
            
            if let Some(ref filters) = query.filters {
                if !self.matches_filters(&vector.metadata, filters) {
                    continue;
                }
            }
            
            let vector_score = self.cosine_similarity(&query.vector, &vector.values);
            let metadata_score = self.compute_metadata_score(&vector.metadata);
            let freshness_score = self.compute_freshness(&vector);
            let final_score = hybrid_alpha * vector_score + (1.0 - hybrid_alpha) * metadata_score;
            
            let trace = QueryTrace {
                steps: vec![
                    crate::models::TraceStep {
                        name: "filter".to_string(),
                        latency_ms: 1,
                        details: serde_json::json!({"passed": true}),
                    },
                    crate::models::TraceStep {
                        name: "similarity".to_string(),
                        latency_ms: 5,
                        details: serde_json::json!({"vector_score": vector_score}),
                    },
                ],
                total_latency_ms: 6,
            };
            
            let scoring_breakdown = ScoringBreakdown {
                vector_score,
                metadata_score,
                final_score,
                explanation: format!("alpha={hybrid_alpha}: vector={vector_score:.3}, meta={metadata_score:.3}"),
            };
            
            results.push(SearchResult {
                id: vector.id,
                score: final_score,
                vector: vector.values.clone(),
                metadata: vector.metadata.clone(),
                trace: Some(trace),
                freshness_score: Some(freshness_score),
                scoring_breakdown: Some(scoring_breakdown),
            });
        }
        
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        results.truncate(limit);
        results
    }

    fn matches_filters(&self, metadata: &crate::models::Metadata, filters: &crate::models::SearchFilters) -> bool {
        if let Some(ref cat) = filters.category {
            if metadata.category.as_ref() != Some(cat) {
                return false;
            }
        }
        
        if let Some(ref sid) = filters.source_id {
            if metadata.source_id.as_ref() != Some(sid) {
                return false;
            }
        }
        
        if let Some(ref tags) = filters.tags {
            if !tags.iter().any(|t| metadata.tags.contains(t)) {
                return false;
            }
        }
        
        true
    }

    fn compute_metadata_score(&self, metadata: &crate::models::Metadata) -> f32 {
        let mut score: f32 = 0.5;
        
        if metadata.category.is_some() {
            score += 0.15;
        }
        if metadata.source_id.is_some() {
            score += 0.15;
        }
        score += (metadata.tags.len() as f32) * 0.1;
        
        score.min(1.0)
    }

    fn compute_freshness(&self, vector: &Vector) -> f32 {
        let age_seconds = (Utc::now() - vector.created_at).num_seconds().min(86400) as f32;
        let max_age: f32 = 86400.0;
        (1.0 - (age_seconds / max_age)).max(0.0)
    }

    pub fn remove_stale(&self, max_age_seconds: i64) -> usize {
        let now = Utc::now();
        let mut count = 0;
        
        self.index.retain(|_, v| {
            let age = (now - v.updated_at).num_seconds();
            if age > max_age_seconds {
                count += 1;
                false
            } else {
                true
            }
        });
        
        count
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