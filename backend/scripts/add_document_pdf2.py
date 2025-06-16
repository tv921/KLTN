import os
os.environ["PYTHONIOENCODING"] = "utf-8"
import re
from datetime import datetime
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from sentence_transformers import SentenceTransformer
import torch
from dotenv import load_dotenv
import sys
import io
import time
import easyocr
reader = easyocr.Reader(['vi'], gpu=torch.cuda.is_available(), verbose=False)


# OCR libraries
from pdf2image import convert_from_path
import pytesseract
from concurrent.futures import ThreadPoolExecutor, as_completed

# Cấu hình pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Đảm bảo in Unicode ra console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# --- 1. Trích xuất văn bản từ PDF bằng OCR ---
def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        poppler_path = r"C:\Program Files\poppler-24.08.0\Library\bin"
        images = convert_from_path(
            pdf_path,
            dpi=200,
            poppler_path=poppler_path,
            thread_count=4,
            grayscale=True
        )

        for img in images:
            text += pytesseract.image_to_string(
                img,
                lang='vie',
                config='--oem 1'  # sử dụng LSTM (tessdata_fast)
            ) + "\n"

    except Exception as e:
        print(f"Lỗi OCR file {pdf_path}: {e}")
    return text.strip()



def clean_ocr_text(text):
    corrections = {
        'l': '1',
        'I': '1',
        'O': '0',
        'o': '0',
        'Z': '2'
    }
    return ''.join(corrections.get(c, c) for c in text)

# --- 2. Trích xuất ngày ban hành từ văn bản ---
def extract_promulgation_date(text):
    text = clean_ocr_text(text)
    full_date = re.search(r"ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})", text, re.IGNORECASE)
    if full_date:
        try:
            d, m, y = map(int, full_date.groups())
            return datetime(y, m, d).strftime("%Y-%m-%d")
        except:
            pass
    month_year = re.search(r"tháng\s+(\d{1,2})\s+năm\s+(\d{4})", text, re.IGNORECASE)
    if month_year:
        try:
            m, y = map(int, month_year.groups())
            return datetime(y, m, 1).strftime("%Y-%m-%d")
        except:
            pass
    simple_date = re.search(r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})", text)
    if simple_date:
        try:
            d, m, y = map(int, simple_date.groups())
            return datetime(y, m, d).strftime("%Y-%m-%d")
        except:
            pass
    iso_match = re.search(r"(\d{4}-\d{2}-\d{2})T", text)
    if iso_match:
        return iso_match.group(1)
    return None

# --- 3. Load biến môi trường từ .env ---
load_dotenv()
ELASTIC_URL = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
ELASTIC_USER = os.getenv("ELASTICSEARCH_USERNAME")
ELASTIC_PASS = os.getenv("ELASTICSEARCH_PASSWORD")

# --- 4. Kết nối Elasticsearch ---
if ELASTIC_USER and ELASTIC_PASS:
    es = Elasticsearch(
        hosts=[ELASTIC_URL],
        basic_auth=(ELASTIC_USER, ELASTIC_PASS),
        request_timeout=30
    )
else:
    es = Elasticsearch(ELASTIC_URL)

INDEX_NAME = "pdf_documents1"

# --- 5. Load mô hình SentenceTransformer ---
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Đang sử dụng device: {device}")
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', device=device)

# --- 6. Tạo chỉ mục nếu chưa có ---
def create_index():
    if es.indices.exists(index=INDEX_NAME):
        print(f"Index '{INDEX_NAME}' đã tồn tại.")
        return
    print(f"Tạo mới index '{INDEX_NAME}'.")
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
                    "similarity": "cosine"
                }
            }
        }
    }
    es.indices.create(index=INDEX_NAME, body=mapping)
    print(f"Đã tạo index '{INDEX_NAME}'.")

# --- 7. Chuẩn bị tài liệu từ 1 file PDF ---
def process_pdf_for_indexing(pdf_path):
    start_time = time.time()
    doc_id = os.path.basename(pdf_path)

    if es.exists(index=INDEX_NAME, id=doc_id):
        print(f"❌ {doc_id} đã tồn tại. Bỏ qua.")
        return None

    print(f"🔄 Đang xử lý: {doc_id}")

    # --- OCR ---
    t0 = time.time()
    text = extract_text_from_pdf(pdf_path)
    t1 = time.time()
    if not text:
        print(f"⚠️ Không đọc được nội dung từ {doc_id}")
        return None
    print(f"🧾 OCR: {(t1 - t0):.2f}s")

    # --- Trích ngày ---
    t0 = time.time()
    ngay_ban_hanh = extract_promulgation_date(text)
    t1 = time.time()
    print(f"📅 Trích ngày: {(t1 - t0):.2f}s")

    # --- Encode vector ---
    t0 = time.time()
    vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True).tolist()
    t1 = time.time()
    print(f"🧠 Encode vector: {(t1 - t0):.2f}s")

    total_time = time.time() - start_time
    print(f"✅ {doc_id} xử lý xong trong {total_time:.2f}s\n")

    doc = {
        "_index": INDEX_NAME,
        "_id": doc_id,
        "_source": {
            "title": os.path.basename(pdf_path),
            "file_path": pdf_path,
            "content": text,
            "ngay_ban_hanh": ngay_ban_hanh,
            "vector": vector
        }
    }
    return doc


# --- 8. Index tất cả file PDF trong thư mục ---
def index_pdf_folder(folder_path, max_workers=4):
    create_index()
    pdf_files = [
        os.path.join(folder_path, f)
        for f in os.listdir(folder_path)
        if f.lower().endswith(".pdf")
    ]
    docs = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_pdf_for_indexing, path) for path in pdf_files]
        for future in as_completed(futures):
            result = future.result()
            if result:
                docs.append(result)
    if docs:
        success, _ = bulk(es, docs)
        print(f"✅ Đã index {success}/{len(docs)} tài liệu.")
    else:
        print("⚠️ Không có tài liệu mới để index.")

# --- 9. Main ---
if __name__ == "__main__":
    PDF_FOLDER = r"C:\myProject\KLTN\backend\documents"
    index_pdf_folder(PDF_FOLDER)
