# Guide de déploiement Vector Citadel

## Prérequis

| Outil | Version minimale | Usage |
|-------|------------------|-------|
| Docker | 24.0+ | Orchestration |
| Rust | 1.85+ | Build backend |
| Python | 3.12+ | Ingestion |
| Node.js | 20+ | Frontend |

## Déploiement local

### Méthode recommandée : Docker Compose

```bash
# Lancer tous les services
docker-compose up --build

# En détaché
docker-compose up -d --build

# Logs
docker-compose logs -f rust-core
```

Services exposés :
- `http://localhost:8080` - API Rust backend
- `http://localhost:3000` - Dashboard Frontend
- `http://localhost:5432` - PostgreSQL (optionnel)

### Développement local (hot reload)

```bash
# Terminal 1 : Backend
cd rust-core
cargo run

# Terminal 2 : Frontend  
cd frontend-dashboard
npm run dev

# Terminal 3 : Ingestion
cd python-ingestion
pip install -e .
python -m ingestion.cli --demo
```

## Configuration

### Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `RUST_LOG` | `info` | Niveau logging (trace, debug, info, warn, error) |
| `PORT` | `8080` | Port HTTP du serveur |
| `INDEX_DIM` | `1536` | Dimension embeddings |
| `MAX_VECTORS` | `1000000` | Limite mémoire |

### Configuration Docker

```yaml
# docker-compose.override.yml
services:
  rust-core:
    environment:
      - RUST_LOG=debug
      - INDEX_DIM=768
    volumes:
      - ./data:/app/data
```

## Production

### Docker Swarm

```bash
docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml vector-citadel
```

### Kubernetes

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vector-citadel
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vector-citadel
  template:
    metadata:
      labels:
        app: vector-citadel
    spec:
      containers:
      - name: core
        image: ghcr.io/brainfeed-1996/vector-citadel:latest
        ports:
        - containerPort: 8080
        env:
        - name: RUST_LOG
          value: "info"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: vector-citadel
spec:
  selector:
    app: vector-citadel
  ports:
  - port: 80
    targetPort: 8080
```

## Monitoring

### Health checks

```bash
# Health endpoint
curl -f http://localhost:8080/health || exit 1

# GC status
curl http://localhost:8080/admin/gc
```

### Logs structurés

Format JSON avec champs :
- `timestamp` : ISO8601
- `level` : error/warn/info/debug
- `span` : endpoint/trace
- `latency_ms` : durée requête

### Métriques (future)

- `vector_count` - Nombre total vecteurs
- `search_latency_ms` - Histogramme latence
- `gc_removed_total` - Compteur GC
- `memory_usage_bytes` - Utilisation mémoire