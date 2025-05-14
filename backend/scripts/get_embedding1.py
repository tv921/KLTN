import sys
import json
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')

def get_embedding(text):
    return model.encode(text, convert_to_numpy=True, normalize_embeddings=True).tolist()

if __name__ == "__main__":
    query = sys.argv[1]
    print(json.dumps(get_embedding(query)))
