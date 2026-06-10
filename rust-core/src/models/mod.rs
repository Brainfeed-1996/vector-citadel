use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

mod metadata;

pub use metadata::Metadata;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vector {
    pub id: Uuid,
    pub values: Vec<f32>,
    pub metadata: Metadata,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}