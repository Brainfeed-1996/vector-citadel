use actix_web::{web, App, HttpServer};
use actix_web::middleware::Logger;
use std::sync::Arc;
use tracing_subscriber::{fmt, EnvFilter};

mod models;
mod routes;
mod services;

use services::vector::VectorIndexService;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("info".parse().unwrap()))
        .init();

    let index_service = Arc::new(VectorIndexService::new());

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(index_service.clone()))
            .wrap(Logger::default())
            .service(routes::health::health_check)
            .service(routes::vectors::upsert)
            .service(routes::vectors::search)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}