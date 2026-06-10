# Référence API REST

## Endpoints

### GET /health

Vérifie la santé du service.

```bash
curl http://localhost:8080/health
```

Réponse :
```json
{
  "status": "healthy",
  "timestamp": "2026-06-10T18:30:00Z"
}
```

### POST /vectors/upsert

Ajoute ou met à jour un vecteur.

Corps de la requête :
```json
{
  "id": "uuid-optionnel",
  "values": [0.1, 0.2, ...],
  "metadata": {
    "source_id": "string",
    "category": "string",
    "tags": ["tag1", "tag2"],
    "custom": {}
  }
}
```

### POST /vectors/search

Recherche les k vecteurs les plus similaires.

Corps de la requête :
```json
{
  "vector": [0.1, 0.2, ...],
  "limit": 10,
  "filters": {
    "category": "tech",
    "tags": ["ai"],
    "source_id": "web-crawler"
  },
  "hybrid_alpha": 0.7
}
```

Réponse :
```json
[
  {
    "id": "uuid",
    "score": 0.95,
    "vector": [...],
    "metadata": {...},
    "trace": {
      "steps": [...],
      "total_latency_ms": 12
    }
  }
]
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide (dimensions mismatch) |
| 500 | Erreur interne du serveur |