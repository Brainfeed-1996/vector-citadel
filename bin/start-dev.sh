#!/bin/bash
# Vector Citadel - Script de démarrage local

echo "🚀 Démarrage de Vector Citadel..."

# Démarrer le backend Rust en arrière-plan
cd rust-core && cargo run &
BACKEND_PID=$!

# Attendre que le backend soit prêt
sleep 3

# Démarrer le frontend
cd ../frontend-dashboard && npm run dev &
FRONTEND_PID=$!

echo "✅ Services démarrés"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8080"

# Attendre les processus
wait $BACKEND_PID $FRONTEND_PID