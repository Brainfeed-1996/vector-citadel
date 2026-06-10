# Standards de contribution

## Convention des commits

```
feat: ajout nouvelle fonctionnalité
fix: correction de bug
docs: documentation
perf: optimisation performance
refactor: refactoring code
test: ajout ou correction de tests
```

## Qualité du code

### Rust
```bash
cargo fmt          # Formatage
cargo clippy       # Linting
cargo test         # Tests
```

### Python
```bash
ruff check src/    # Linting
ruff format src/   # Formatage
```

### Frontend
```bash
npm run lint       # ESLint
npm run build      # Build
```

## Process de review

1. Branch feature depuis `main`
2. Tests passent localement
3. CI/CD passe (build + lint)
4. Review par au moins un reviewer
5. Merge avec squash