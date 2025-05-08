import os
from elasticsearch import Elasticsearch
from transformers import AutoTokenizer, AutoModel
import torch
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Connect to Elasticsearch
es = Elasticsearch(
    hosts=[os.getenv("ELASTICSEARCH_URL")],
    basic_auth=(os.getenv("ELASTICSEARCH_USERNAME"), os.getenv("ELASTICSEARCH_PASSWORD")),
    request_timeout=30
)

# Initialize DistilBERT model
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-multilingual-cased")
model = AutoModel.from_pretrained("distilbert-base-multilingual-cased")

def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy().tolist()

# Fetch all documents from index
response = es.search(
    index="documents",
    body={
        "query": {"match_all": {}},
        "size": 100,
        "_source": ["text", "title"]
    },
    scroll="2m"
)

scroll_id = response["_scroll_id"]
hits = response["hits"]["hits"]

while hits:
    for hit in hits:
        doc_id = hit["_id"]
        content = hit["_source"].get("text", hit["_source"].get("title", ""))
        if content:
            # Generate vector embedding
            vector = get_embedding(content)
            # Update document with vector field
            es.update(
                index="documents",
                id=doc_id,
                body={"doc": {"vector": vector}}
            )
            print(f"Updated vector for document {doc_id}")
    
    # Fetch next batch
    response = es.scroll(scroll_id=scroll_id, scroll="2m")
    hits = response["hits"]["hits"]

# Clear scroll
es.clear_scroll(scroll_id=scroll_id)