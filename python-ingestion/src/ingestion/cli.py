import requests
import json
import argparse
import numpy as np
from typing import List, Dict, Any
from pathlib import Path
from tqdm import tqdm
import time

API_URL = "http://localhost:8080"

def generate_mock_embeddings(count: int, dim: int = 1536) -> List[List[float]]:
    np.random.seed(42)
    embeddings = []
    for _ in range(count):
        vec = np.random.randn(dim).astype(np.float32).tolist()
        embeddings.append(vec)
    return embeddings

def generate_mock_metadata(count: int) -> List[Dict[str, Any]]:
    categories = ["tech", "science", "finance", "health", "news"]
    sources = ["web-crawler", "api-ingest", "db-export", "pdf-parser", "news-api"]
    
    metadata = []
    for i in range(count):
        meta = {
            "source_id": f"{sources[i % len(sources)]}_{i}",
            "category": categories[i % len(categories)],
            "tags": [f"tag_{j}" for j in range((i % 3) + 1)]
        }
        metadata.append(meta)
    return metadata

def load_demo_vectors(path: str = "demo-data/demo_vectors.json") -> tuple[List[List[float]], List[Dict[str, Any]]]:
    demo_path = Path(path)
    if not demo_path.exists():
        print(f"Demo file not found: {path}")
        return [], []
    
    with open(demo_path) as f:
        data = json.load(f)
    
    vectors = [item["values"] for item in data]
    metadata = [item["metadata"] for item in data]
    return vectors, metadata

def upsert_batch(vectors: List[List[float]], metadata: List[Dict[str, Any]], dry_run: bool = False) -> int:
    if dry_run:
        print(f"[DRY RUN] Would upsert {len(vectors)} vectors")
        return 0
    
    success_count = 0
    for i, (vec, meta) in enumerate(tqdm(zip(vectors, metadata), total=len(vectors), desc="Ingesting")):
        payload = {
            "values": vec,
            "metadata": meta
        }
        try:
            r = requests.post(f"{API_URL}/vectors/upsert", json=payload, timeout=5)
            if r.status_code == 200:
                success_count += 1
            else:
                print(f"Error upserting vector {i}: {r.status_code}")
        except Exception as e:
            print(f"Connection error at vector {i}: {e}")
    
    print(f"\nUpserted {success_count}/{len(vectors)} vectors to {API_URL}")
    return success_count

def main():
    parser = argparse.ArgumentParser(description="Vector Citadel Ingestion CLI")
    parser.add_argument("--count", type=int, default=0, help="Number of vectors to generate")
    parser.add_argument("--dim", type=int, default=1536, help="Embedding dimension")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode")
    parser.add_argument("--demo", action="store_true", help="Load demo data from demo-data/demo_vectors.json")
    
    args = parser.parse_args()
    
    if args.demo:
        vectors, metadata = load_demo_vectors()
        if vectors:
            upsert_batch(vectors, metadata, args.dry_run)
            return
    
    count = args.count or 100
    embeddings = generate_mock_embeddings(count, args.dim)
    metadata = generate_mock_metadata(count)
    
    upsert_batch(embeddings, metadata, args.dry_run)

if __name__ == "__main__":
    main()