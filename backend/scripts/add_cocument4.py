import os
import pandas as pd
import torch
from elasticsearch import Elasticsearch
from tqdm import tqdm
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# === 1. Load biến môi trường từ .env ===
load_dotenv()
ELASTIC_URL = os.getenv("ELASTICSEARCH_URL")
ELASTIC_USER = os.getenv("ELASTICSEARCH_USERNAME")
ELASTIC_PASS = os.getenv("ELASTICSEARCH_PASSWORD")

# === 2. Kết nối Elasticsearch ===
es = Elasticsearch(
    hosts=[ELASTIC_URL],
    basic_auth=(ELASTIC_USER, ELASTIC_PASS),
    request_timeout=30
)

index_name = "new_documents2"

# === 3. Tạo lại index với mapping có hỗ trợ autocomplete ===
mapping = {
    "settings": {
        "analysis": {
            "analyzer": {
                "vietnamese_analyzer": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": ["lowercase", "vietnamese_stop"]
                }
            },
            "filter": {
                "vietnamese_stop": {
                    "type": "stop",
                    "stopwords": "_vietnamese_"
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "category": {"type": "keyword"},
            "title": {"type": "text", "analyzer": "vietnamese_analyzer"},
            "title_suggest": {"type": "completion"},
            "url": {"type": "keyword"},
            "published": {"type": "text"},
            "content": {"type": "text", "analyzer": "vietnamese_analyzer"},
            "vector": {
                "type": "dense_vector",
                "dims": 384,
                "index": True,
                "similarity": "cosine",
                "index_options": {
                    "type": "int8_hnsw",
                    "m": 16,
                    "ef_construction": 100
                }
            }
        }
    }
}

# Xoá và tạo lại index mới
if es.indices.exists(index=index_name):
    es.indices.delete(index=index_name)
es.indices.create(index=index_name, body=mapping)

# === 4. Load mô hình embedding
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', device=device)

def embed_text(text):
    return model.encode(text.strip(), convert_to_numpy=True, normalize_embeddings=True).tolist()

# === 5. Đọc file Excel chứa toàn bài
df = pd.read_excel("vnexpress_processed_full.xlsx")

# === 6. Index từng bài viết vào Elasticsearch, thêm trường title_suggest ===
for _, row in tqdm(df.iterrows(), total=len(df)):
    content = str(row["content"])
    vector = embed_text(content)

    doc = {
        "category": row["category"],
        "title": row["title"],
        "title_suggest": row["title"],    # Trường cho autocomplete
        "url": row["url"],
        "published": row["published"],
        "content": content,
        "vector": vector
    }

    es.index(index=index_name, document=doc)

print("✅ Đã index toàn bộ bài viết vào Elasticsearch với autocomplete.")
