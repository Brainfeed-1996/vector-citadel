@echo off
REM Vector Citadel - Script de démarrage local
REM Démarre tous les services en parallèle

echo 🚀 Démarrage de Vector Citadel...

REM Démarrer le backend Rust en arrière-plan
start "Rust Backend" cmd /c "cd rust-core && cargo run"

REM Attendre que le backend soit prêt
timeout /t 3 /nobreak >nul

REM Démarrer le frontend
start "Frontend" cmd /c "cd frontend-dashboard && npm run dev"

echo ✅ Services démarrés
echo 🌐 Frontend: http://localhost:3000
echo 🔧 API: http://localhost:8080