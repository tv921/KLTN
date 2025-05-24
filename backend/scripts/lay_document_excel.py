import os
import pandas as pd
from fpdf import FPDF

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
font_path = os.path.join(BASE_DIR, 'DejaVuSans.ttf')

output_dir = r'C:\myProject\KLTN\documents'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

df = pd.read_excel(r'C:\myProject\KLTN\backend\scripts\vnexpress_processed_full.xlsx')
df_50 = df.head(50)

class PDF(FPDF):
    def header(self):
        self.set_font('DejaVu', '', 12)

    def footer(self):
        self.set_y(-15)
        self.set_font('DejaVu', '', 8)

for i, row in df_50.iterrows():
    pdf = PDF()
    pdf.add_font('DejaVu', '', font_path, uni=True)
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font('DejaVu', '', 12)

    # Chỉ lấy 2 cột 'title' và 'content'
    pdf.multi_cell(0, 10, str(row['title']) if row['title'] is not None else "")
    pdf.ln(5)  # xuống dòng thêm chút cho dễ đọc
    pdf.multi_cell(0, 10, str(row['content']) if row['content'] is not None else "")

    filename = os.path.join(output_dir, f"tai_lieu_{i+1}.pdf")
    pdf.output(filename)

print(f"Đã tạo 50 file PDF trong thư mục '{output_dir}'.")



