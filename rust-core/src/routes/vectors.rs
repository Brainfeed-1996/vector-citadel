use actix_web::{post, web, HttpResponse, Responder};
use std::sync::Arc;
use crate::models::{UpsertVector, SearchQuery};
use crate::services::VectorIndexService;

#[post("/vectors/upsert")]
pub async fn upsert(
    service: web::Data<Arc<VectorIndexService>>,
    payload: web::Json<UpsertVector>,
) -> impl Responder {
    let vector = service.upsert(payload.into_inner());
    HttpResponse::Ok().json(vector)
}

#[post("/vectors/search")]
pub async fn search(
    service: web::Data<Arc<VectorIndexService>>,
    payload: web::Json<SearchQuery>,
) -> impl Responder {
    let results = service.search(payload.into_inner());
    HttpResponse::Ok().json(results)
}

#[post("/admin/gc")]
pub async fn garbage_collect(
    service: web::Data<Arc<VectorIndexService>>,
) -> impl Responder {
    let removed = service.remove_stale(86400);
    HttpResponse::Ok().json(serde_json::json!({ "removed": removed }))
}