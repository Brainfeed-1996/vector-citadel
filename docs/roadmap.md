# Feuille de route Vector Citadel

## Vision globale

Vector Citadel vise à devenir une infrastructure de recherche vectorielle enterprise-grade, capable de gérer des milliards de vecteurs avec une latence <10ms, un rappel >95%, et une disponibilité 99.99%. Cette feuille de route est organisée en tranches trimestrielles avec des jalons clairs et des métriques de succès.

## Chronologie détaillée

### Q1 2024 - Fondation (S1)
**Statut : TERMINÉ** ✅

```mermaid
gantt
    title Q1 2024 - Fondation
    dateFormat  YYYY-MM-DD
    section Core
    Architecture        :done, a1, 2024-01-01, 14d
    API REST           :done, a2, 2024-01-15, 14d
    Index en mémoire   :done, a3, 2024-01-20, 10d
    section Ingestion
    Pipeline Python    :done, b1, 2024-01-10, 20d
    CLI                :done, b2, 2024-01-25, 7d
    section Frontend
    Dashboard          :done, c1, 2024-01-28, 10d
    Visualisation      :done, c2, 2024-02-05, 10d
```

- **Objectifs** :
  - API HTTP fonctionnelle avec `/health`, `/vectors/upsert`, `/vectors/search`
  - Index DashMap avec recherche séquentielle de base
  - CLI d'ingestion avec génération de demo vectors
  - Dashboard React avec métriques de base
  - Docker Compose opérationnel

- **Métriques de succès** :
  - 100 requêtes/sec sur search
  - <50ms latence moyenne
  - 0 erreur en production

### Q2 2024 - Hybrid & Scale (S2)
**Statut : EN COURS** 🚧

```mermaid
gantt
    title Q2 2024 - Hybrid & Scale
    dateFormat  YYYY-MM-DD
    section Hybrid
    Filtres métadonnées   :active, h1, 2024-04-01, 21d
    Fusion scoring        :active, h2, 2024-04-15, 14d
    Alpha tuning          :active, h3, 2024-04-25, 7d
    section Performance
    Index HNSW            :active, p1, 2024-04-05, 20d
    Benchmark dataset     :p2, 2024-04-20, 15d
    Profiling             :p3, 2024-05-01, 10d
```

- **Fonctionnalités planifiées** :
  - Recherche hybride avec paramètre `hybrid_alpha` (0-1)
  - Filtres sur catégorie, tags, source_id
  - Scoring fusion : `score = α * vector_score + (1-α) * metadata_score`
  - Integration HNSW pour recherche approximative
  - Benchmark avec 10K-100K vecteurs

- **Livrables** :
  - `/vectors/search` accepte `filters` et `hybrid_alpha`
  - Latence <10ms avec 10K vecteurs
  - Throughput >1000 req/sec

### Q3 2024 - Fraîcheur & Persistance (S3)
**Statut : PRÉVU** 📅

```mermaid
gantt
    title Q3 2024 - Fraîcheur & Persistance  
    dateFormat  YYYY-MM-DD
    section Freshness
    TTL implémentation      :f1, 2024-07-01, 14d
    Freshness scoring      :f2, 2024-07-10, 7d
    GC automatique         :f3, 2024-07-20, 14d
    section Persistence
    pgvector adapter       :s1, 2024-07-15, 21d
    Migration outil        :s2, 2024-08-01, 14d
    Sauvegarde             :s3, 2024-08-10, 10d
```

- **Fonctionnalités planifiées** :
  - TTL par vecteur (paramètre `ttl` en secondes)
  - Score de fraîcheur : `freshness = 1 - (age / max_age)`
  - Endpoint `/admin/gc` pour garbage collection
  - Adapter PostgreSQL + pgvector
  - Sauvegarde/restauration index

- **Livrables** :
  - Champ `ttl` dans les métadonnées
  - GC automatisé via cron
  - Persistence fiable avec pgvector

### Q4 2024 - Production & Scale (S4)
**Statut : PRÉVU** 📅

```mermaid
gantt
    title Q4 2024 - Production & Scale
    dateFormat  YYYY-MM-DD
    section Scale
    Shard index            :q1, 2024-10-01, 21d
    Cache Redis            :q2, 2024-10-15, 14d
    Load balancing         :q3, 2024-10-25, 7d
    section Reliability  
    Tests chaos            :r1, 2024-11-01, 14d
    Monitoring             :r2, 2024-11-10, 7d
    Docs API               :r3, 2024-11-15, 10d
```

- **Fonctionnalités planifiées** :
  - Sharding horizontal par shard_id
  - Cache Redis pour hot vectors
  - Load balancing avec consistent hashing
  - Tests chaos avec Jepsen-style
  - Prometheus metrics
  - Documentation OpenAPI complète

## Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Performance HNSW décrite | Moyen | Élevé | Benchmark précoce, fallback linéaire |
| Lock contention DashMap | Faible | Moyen | Tests charge, batch writes |
| OOM mémoire | Moyen | Élevé | GC proactive, monitoring mémoire |

## Métriques clés

- **Throughput** : Requêtes/sec
- **Latence P99** : Temps de réponse
- **Rappel@k** : Pertinence des résultats
- **Disponibilité** : Uptime service
- **Fraîcheur** : % vecteurs <24h

## Évolution produit

```
v0.1 → v0.2 → v0.3 → v0.4 → v1.0
  ↓      ↓      ↓      ↓      ↓
Core   Hybrid  Fresh   Scale  Prod
```