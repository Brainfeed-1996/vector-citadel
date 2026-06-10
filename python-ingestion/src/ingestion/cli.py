import requests
import json
import argparse
import numpy as np
from typing import List, Dict, Any, Optional
import time

API_URL = "http://localhost:8080"

def generate_mock_embeddings(count: int, dim: int = 1536) -> List[List[float]]:
    np.random.seed(42)
    return [np.random.randn(dim).tolist() for _ in range(count)]

def generate_mock_metadata(count: int) -> List[Dict[str, Any]]:
    categories = ["tech", "science", "finance", "health", "news"]
    sources = ["web", "api", "database", "file", "stream"]
    
    metadata = []
    for i in range(count):
        meta = {
            "source_id": f"{sources[i % len(sources)]}_{i}",
            "category": categories[i % len(categories)],
            "tags": [f"tag_{j}" for j in range((i % 3) + 1)]
        }
        metadata.append(meta)
    return metadata

def upsert_batch(vectors: List[List[float]], metadata: List[Dict[str, Any]], dry_run: bool = False) -> None:
    if dry_run:
        print(f"[DRY RUN] Would upsert {len(vectors)} vectors")
        return
    
    for i, (vec, meta) in enumerate(zip(vectors, metadata)):
        payload = {
            "values": vec,
            "metadata": meta
        }
        try:
            r = requests.post(f"{API_URL}/vectors/upsert", json=payload, timeout=5)
            if r.status_code != 200:
                print(f"Error upserting vector {i}: {r.text}")
        except Exception as e:
            print(f"Connection error: {e}")
        
    print(f"Upserted {len(vectors)} vectors to {API_URL}")

def main():
    parser = argparse.ArgumentParser(description="Vector Citadel Ingestion CLI")
    parser.add_argument("--count", type=int, default=100, help="Number of vectors to generate")
    parser.add_argument("--dim", type=int, default=1536, help="Embedding dimension")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode")
    parser.add_argument("--demo", action="store_true", help="Load demo data")
    
    args = parser.parse_args()
    
    embeddings = generate_mock_embeddings(args.count, args.dim)
    metadata = generate_mock_metadata(args.count)
    
    upsert_batch(embeddings, metadata, args.dry_run)
    
    if args.demo:
        print(f"Loaded demo data: {args.count} vectors of dimension {args.dim}")

if __name__ == "__main__":
    main()