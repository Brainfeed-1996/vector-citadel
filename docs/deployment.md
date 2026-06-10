# Guide de déploiement

## Déploiement local

### Prérequis
- Docker & Docker Compose
- Rust 1.85+ (pour dev)
- Python 3.12+ (pour ingestion)
- Node.js 20+ (pour frontend)

### Démarrage avec Docker Compose

```bash
# Build et lancement
docker-compose up --build

# Services disponibles:
# - http://localhost:8080 - API Rust
# - http://localhost:3000 - Frontend Dashboard
```

### Développement local

Rust (backend):
```bash
cd rust-core
cargo run
```

Frontend:
```bash
cd frontend-dashboard
npm run dev
```

Ingestion Python:
```bash
cd python-ingestion
pip install -e .
python -m ingestion.cli --demo
```

## Production

### Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| RUST_LOG | info | Niveau de log |
| PORT | 8080 | Port du serveur |

### Orchestration Kubernetes

```yaml
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
    spec:
      containers:
      - name: core
        image: vector-citadel:latest
        ports:
        - containerPort: 8080
```