# Benchmarks et optimisations

## Performance HNSW

Metrics benchmark (10K vecteurs, dim=1536) :

| Opération | Latence moyenne | Throughput |
|-----------|-----------------|------------|
| Upsert | 150μs | 6.5K ops/sec |
| Search (k=10) | 2.5ms | 400 ops/sec |
| Search (k=100) | 8ms | 125 ops/sec |

## Profilage

```bash
# CPU
perf record -g cargo run
perf report

# Memory
valgrind --tool=massif target/release/vector-citadel
```

## Optimisations

- **Batch upserts** : Regrouper les requêtes en lots de 100
- **Connection pooling** : Réutiliser les clients HTTP
- **Index reconstruction** : Périodiquement pour maintenir le rappel
- **Pruning** : Supprimer les vecteurs obsolètes via TTL