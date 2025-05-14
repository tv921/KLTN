import os
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModel
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

index_name = "new_documents"

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
                    "stopwords": "_vietnamese_"  # sẽ dùng stopwords tiếng Việt nếu có
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "label": {"type": "keyword"},
            "title": {"type": "text", "analyzer": "vietnamese_analyzer"},
            "text": {"type": "text", "analyzer": "vietnamese_analyzer"},
            "summary": {"type": "text", "analyzer": "vietnamese_analyzer"},
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



if es.indices.exists(index=index_name):
    es.indices.delete(index=index_name)
es.indices.create(index=index_name, body=mapping)

# === 3. Load mô hình DistilBERT ===
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')

def embed_text(text):
    vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return vector.tolist()

# === 4. Đọc file Excel và đẩy dữ liệu ===
excel_path = os.path.join(os.path.dirname(__file__), "100.xlsx")
df = pd.read_excel(excel_path)

for _, row in tqdm(df.iterrows(), total=len(df)):
    label = str(row['label'])
    title = str(row['title'])
    text = str(row['text'])
    summary = str(row['sumary']) if 'sumary' in row else str(row.get('summary', ''))

    full_text = f"{title}. {text} {summary}"
    vector = embed_text(full_text)

    doc = {
        "label": label,
        "title": title,
        "text": text,
        "summary": summary,
        "vector": vector
    }

    es.index(index=index_name, document=doc)

print("✅ Dữ liệu đã được đưa vào Elasticsearch.")
