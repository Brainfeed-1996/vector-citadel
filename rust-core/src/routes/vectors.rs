use actix_web::{post, web, HttpResponse, Responder};
use std::sync::Arc;
use crate::models::{UpsertVector, SearchQuery, SearchResult, Vector};
use crate::services::VectorIndexService;

#[post("/vectors/upsert")]
pub async fn upsert(
    service: web::Data<Arc<VectorIndexService>>,
    payload: web::Json<UpsertVector>,
) -> impl Responder {
    match service.upsert(payload.into_inner()) {
        Ok(vector) => HttpResponse::Ok().json(vector),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({ "error": e })),
    }
}

#[post("/vectors/search")]
pub async fn search(
    service: web::Data<Arc<VectorIndexService>>,
    payload: web::Json<SearchQuery>,
) -> impl Responder {
    let results = service.search(payload.into_inner());
    HttpResponse::Ok().json(results)
}