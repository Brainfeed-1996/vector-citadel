# Référence API REST Vector Citadel

## Principes

L'API REST suit les principes REST avec JSON. Tous les endpoints sont préfixés par `/api/` via le proxy Nginx.

## Endpoints publics

### GET /health

Vérifie la santé du service backend Rust.

```bash
curl http://localhost:8080/health
```

Réponse :
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Codes retour** :
- 200 : Service sain
- 503 : Service indisponible

---

### POST /vectors/upsert

Ajoute ou met à jour un vecteur dans l'index.

**Request Body** :
```json
{
  "id": "uuid-optionnel",
  "values": [0.12, 0.34, 0.56, ...],
  "metadata": {
    "source_id": "web-crawler-0",
    "category": "tech",
    "tags": ["ai", "ml"],
    "custom": {"key": "value"}
  },
  "ttl": 3600
}
```

**Champs** :
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| id | UUID | Non | UUID existant pour update, ou génération auto |
| values | float[] | Oui | Embedding du vecteur |
| metadata | object | Non | Métadonnées associées |
| ttl | integer | Non | TTL en secondes (optionnel) |

**Réponse** :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "values": [0.12, 0.34, ...],
  "metadata": {
    "source_id": "web-crawler-0",
    "category": "tech",
    "tags": ["ai", "ml"]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### POST /vectors/search

Recherche les k vecteurs les plus similaires avec filtres optionnels.

**Request Body** :
```json
{
  "vector": [0.1, 0.2, ...],
  "limit": 10,
  "filters": {
    "category": "tech",
    "tags": ["ai"],
    "source_id": null
  },
  "hybrid_alpha": 0.7
}
```

**Paramètres** :
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| vector | float[] | - | Query embedding |
| limit | integer | 10 | Nombre max de résultats |
| filters | object | null | Filtres métadonnées |
| hybrid_alpha | float | 0.7 | Poids vector vs metadata (0-1) |

**Réponse** :
```json
[
  {
    "id": "uuid-1",
    "score": 0.95,
    "freshness_score": 0.87,
    "vector": [0.12, 0.34, ...],
    "metadata": {
      "source_id": "web-crawler-0",
      "category": "tech"
    },
    "scoring_breakdown": {
      "vector_score": 0.92,
      "metadata_score": 0.80,
      "final_score": 0.95,
      "explanation": "alpha=0.7: vector=0.92, meta=0.80"
    },
    "trace": {
      "steps": [
        {"name": "filter", "latency_ms": 1, "details": {"passed": true}},
        {"name": "similarity", "latency_ms": 5, "details": {"vector_score": 0.92}}
      ],
      "total_latency_ms": 6
    }
  }
]
```

## Endpoints admin

### POST /admin/gc

Force le garbage collection des vecteurs expirés.

```bash
curl -X POST http://localhost:8080/admin/gc
```

Réponse :
```json
{
  "removed": 42
}
```

## Codes d'erreur

| Code | Description | Exemple |
|------|-------------|---------|
| 400 | Requête invalide | Dimensions mismatch |
| 422 | Validation échouée | Filtre malformé |
| 500 | Erreur serveur | Panic interne |
| 503 | Service indisponible | En maintenance |

## Exemples d'utilisation

### Ingestion par lot (Python)
```python
import requests
for i, (vec, meta) in enumerate(zip(vectors, metadata)):
    r = requests.post("http://localhost:8080/vectors/upsert", json={
        "values": vec,
        "metadata": meta
    })
    assert r.status_code == 200
```

### Recherche avec filtre
```bash
curl -X POST http://localhost:8080/vectors/search \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, ...],
    "limit": 5,
    "filters": {"category": "tech"},
    "hybrid_alpha": 0.8
  }'
```