import os
import fitz
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import torch
from dotenv import load_dotenv


# 1. Trích xuất text từ PDF dùng fitz (PyMuPDF)
def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"Lỗi khi đọc file PDF {pdf_path}: {e}")
        return ""

# 2. Load biến môi trường
load_dotenv()
ELASTIC_URL = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
ELASTIC_USER = os.getenv("ELASTICSEARCH_USERNAME")
ELASTIC_PASS = os.getenv("ELASTICSEARCH_PASSWORD")

# 3. Kết nối Elasticsearch với xác thực nếu có
if ELASTIC_USER and ELASTIC_PASS:
    es = Elasticsearch(
        hosts=[ELASTIC_URL],
        basic_auth=(ELASTIC_USER, ELASTIC_PASS),
        request_timeout=30
    )
else:
    es = Elasticsearch(ELASTIC_URL)

INDEX_NAME = "pdf_documents"

# 4. Load mô hình embedding
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Đang sử dụng device: {device}")
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', device=device)

# 5. Tạo index Elasticsearch nếu chưa có, với mapping hỗ trợ vector search
def create_index():
    if es.indices.exists(index=INDEX_NAME):
        print(f"Index '{INDEX_NAME}' đã tồn tại, xoá để tạo lại.")
        es.indices.delete(index=INDEX_NAME)

    mapping = {
        "mappings": {
            "properties": {
                "title": {"type": "keyword"},
                "file_path": {"type": "keyword"},
                "content": {"type": "text"},
                "vector": {
                    "type": "dense_vector",
                    "dims": 384,
                    "index": True,
                    "similarity": "cosine"  # Elasticsearch 8.x hỗ trợ cosine similarity trực tiếp
                }
            }
        }
    }
    es.indices.create(index=INDEX_NAME, body=mapping)
    print(f"Index '{INDEX_NAME}' đã được tạo.")

# 6. Hàm index một file PDF
def index_pdf(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    if not text:
        print(f"File {pdf_path} không có nội dung để index, bỏ qua.")
        return

    vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True).tolist()

    doc = {
        "title": os.path.basename(pdf_path),
        "file_path": pdf_path,
        "content": text,
        "vector": vector
    }

    try:
        res = es.index(index=INDEX_NAME, document=doc)
        print(f"Đã index file: {pdf_path} (id: {res['_id']})")
    except Exception as e:
        print(f"Lỗi khi index file {pdf_path}: {e}")

# 7. Hàm index tất cả file PDF trong thư mục
def index_pdf_folder(folder_path):
    create_index()
    count = 0
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            full_path = os.path.join(folder_path, filename)
            index_pdf(full_path)
            count += 1
    print(f"Tổng số file PDF đã index: {count}")

# 8. Chạy chính
if __name__ == "__main__":
    PDF_FOLDER = r"C:\myProject\KLTN\documents"  # Thay đường dẫn đúng của bạn
    index_pdf_folder(PDF_FOLDER)



