from tika import parser
from pyvi import ViTokenizer
from elasticsearch import Elasticsearch
from transformers import AutoTokenizer, AutoModel
import torch
import os


es = Elasticsearch(
    hosts=["http://localhost:9200"],
    basic_auth=("elastic", "nghiatv123"),
    request_headers={"Accept": "application/vnd.elasticsearch+json; compatible-with=8"}  # Adjust to 7 or 8 based on your server
)

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-multilingual-cased")
model = AutoModel.from_pretrained("distilbert-base-multilingual-cased")

def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

folder_path = "C:\myProject\KLTN\documents"
for filename in os.listdir(folder_path):
    if filename.endswith(".pdf") or filename.endswith(".docx"):
        parsed = parser.from_file(os.path.join(folder_path, filename))
        content = parsed["content"]
        tokenized_content = ViTokenizer.tokenize(content)
        vector = get_embedding(content).tolist()
        doc = {
            "title": parsed["metadata"].get("title", filename),
            "content": tokenized_content,
            "publish_date": parsed["metadata"].get("Creation-Date"),
            "vector": vector
        }
        es.index(index="documents11", body=doc)