import pandas as pd
import re
from bs4 import BeautifulSoup

# Load từ Excel
df = pd.read_excel("wikipedia_vi_articles.xlsx")

# Drop dòng trống
df = df.dropna(subset=['title', 'content'])

# Hàm làm sạch
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = BeautifulSoup(text, "html.parser").get_text()
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# Apply
for col in ['title', 'extract', 'content']:
    df[col] = df[col].apply(clean_text)

# Tùy chọn: cắt bớt nội dung
df['content'] = df['content'].apply(lambda x: x[:2000])

# Save lại (nếu muốn)
df.to_csv("cleaned_wikipedia.csv", index=False, encoding="utf-8-sig")
