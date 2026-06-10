# Compromis architecturaux Vector Citadel

## Rappel vs Latence

| Option | Rappel | Latence | Mémoire |
|--------|--------|---------|---------|
| HNSW (M=10, ef=100) | 0.95 | 5ms | 1GB |
| HNSW (M=20, ef=200) | 0.98 | 15ms | 2GB |
| Brute-force | 1.0 | 100ms | 500MB |

**Décision** : HNSW avec ef=100 pour un bon compromis. Reconstruction périodique pour maintenir le rappel.

## Complexité recherche hybride

La fusion vectoriel + métadonnées introduit :

```
score_final = alpha * score_vector + (1 - alpha) * score_metadata
```

- **Avantage** : Pertinence améliorée avec filtres contextuels
- **Inconvénient** : Tuning complexe, non-transitivité des scores

## Métadonnées en mémoire vs persistance

| Stockage | Vitesse | Persistance | Coût |
|----------|---------|-------------|------|
| Mémoire (DashMap) | ~100μs | Non | Faible |
| PostgreSQL + pgvector | ~5ms | Oui | Élevé |
| Redis | ~1ms | Optionnel | Moyen |

**Décision** : Mémoire pour la vitesse, persistence optionnelle en plugin.

## Dimensions embeddings fixes

- Simplifie l'implémentation HNSW
- Limite la flexibilité pour différents modèles
- Recommandé : 1536 (OpenAI embeddings standard)