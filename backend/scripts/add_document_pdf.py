import os
import fitz  # PyMuPDF
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import torch
from dotenv import load_dotenv
import sys
import io
import re
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8') 

# 1. Trích xuất text từ PDF dùng fitz (PyMuPDF)

def extract_promulgation_date(text):
    # Regex tìm ngày dạng: "ngày 12 tháng 06 năm 2025", "12/06/2025", ...
    patterns = [
        r"ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})",
        r"(\d{1,2})/(\d{1,2})/(\d{4})",
        r"(\d{1,2})-(\d{1,2})-(\d{4})"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                day, month, year = map(int, match.groups())
                date = datetime(year, month, day)
                return date.strftime("%Y-%m-%d")  # ISO format
            except:
                continue
    return None  # Không tìm thấy


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

INDEX_NAME = "pdf_documents1"

# 4. Load mô hình embedding
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Đang sử dụng device: {device}")
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', device=device)

def create_index():
    # Kiểm tra xem chỉ mục đã tồn tại chưa
    if es.indices.exists(index=INDEX_NAME):
        print(f"Index '{INDEX_NAME}' already exists, skipping creation.")
        return  # Bỏ qua việc tạo chỉ mục mới nếu đã tồn tại

    # Nếu chỉ mục chưa tồn tại, tạo mới
    print(f"Creating index '{INDEX_NAME}'.")
    mapping = {
        "mappings": {
            "properties": {
                "title": {"type": "keyword"},
                "file_path": {"type": "keyword"},
                "content": {"type": "text"},
                "ngay_ban_hanh": {"type": "date"},
                "vector": {
                    "type": "dense_vector",
                    "dims": 384,
                    "index": True,
                    "similarity": "cosine"  # Elasticsearch 8.x hỗ trợ cosine similarity trực tiếp
                }
            }
        }
    }

    # Tạo chỉ mục mới
    es.indices.create(index=INDEX_NAME, body=mapping)
    print(f"Index '{INDEX_NAME}' đã được tạo.")

# 6. Hàm index một file PDF
def index_pdf(pdf_path):
    doc_id = os.path.basename(pdf_path)
    if es.exists(index=INDEX_NAME, id=doc_id):
        print(f"Tài liệu {pdf_path} đã tồn tại trong chỉ mục, bỏ qua.")
        return

    text = extract_text_from_pdf(pdf_path)
    if not text:
        print(f"File {pdf_path} không có nội dung để index, bỏ qua.")
        return

    # Trích xuất ngày ban hành
    ngay_ban_hanh = extract_promulgation_date(text)

    vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True).tolist()
    doc = {
        "title": os.path.basename(pdf_path),
        "file_path": pdf_path,
        "content": text,
        "vector": vector,
        "ngay_ban_hanh": ngay_ban_hanh  # Có thể là None nếu không tìm thấy
    }

    try:
        res = es.index(index=INDEX_NAME, id=doc_id, document=doc)
        print(f"Đã index file: {pdf_path} (id: {res['_id']}) - Ngày ban hành: {ngay_ban_hanh}")
    except Exception as e:
        print(f"Lỗi khi index file {pdf_path}: {e}")



# 7. Hàm index tất cả file PDF trong thư mục
def index_pdf_folder(folder_path):
    create_index()  # Gọi hàm tạo chỉ mục chỉ nếu nó chưa tồn tại
    count = 0
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            full_path = os.path.join(folder_path, filename)
            index_pdf(full_path)
            count += 1
    print(f"Tổng số file PDF đã index: {count}")

# 8. Chạy chính
if __name__ == "__main__":
    PDF_FOLDER = r"C:\myProject\KLTN\backend\documents"  # Thay đường dẫn đúng của bạn
    index_pdf_folder(PDF_FOLDER)