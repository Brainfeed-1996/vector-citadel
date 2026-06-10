# Feuille de route Vector Citadel

## Court terme (Phase 1-2)

- Index vectoriel HNSW fonctionnel
- Pipeline d'ingestion Python avec CLI
- Endpoints REST de base (upsert, search)
- Dashboard frontend minimal
- Docker Compose opérationnel

## Moyen terme (Phase 3-4)

- Recherche hybride avec fusion scores
- Filtres métadonnées dynamiques
- Tracing des requêtes (waterfall)
- Métriques temps réel (latence, recall)
- Tests d'intégration

## Long terme (Phase 5-6)

- TTL et gestion de fraîcheur
- Re-indexation automatique
- Benchmark Jepsen-style
- Cache distribué (Redis)
- Persistence pgvector

## Échéances

| Version | Date cible | Fonctionnalités |
|---------|------------|-----------------|
| v0.1    | S1 2026    | Core + Docker |
| v0.2    | S2 2026    | Hybride + Tracing |
| v0.3    | S3 2026    | Fraîcheur + Persistence |
| v1.0    | S4 2026    | Production-ready |