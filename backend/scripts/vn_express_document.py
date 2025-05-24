import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import time
import random

# Danh sách RSS chuyên mục
rss_feeds = {
    "Kinh doanh": "https://vnexpress.net/rss/kinh-doanh.rss",
    "Sức khỏe": "https://vnexpress.net/rss/suc-khoe.rss",
    "Giáo dục": "https://vnexpress.net/rss/giao-duc.rss",
    "Thể thao": "https://vnexpress.net/rss/the-thao.rss",
    "Khoa học công nghệ": "https://vnexpress.net/rss/khoa-hoc.rss"
}

articles = []

for category, feed_url in rss_feeds.items():
    try:
        print(f"\n🔍 Đang đọc RSS: {category}")
        res = requests.get(feed_url, timeout=10)
        soup = BeautifulSoup(res.content, features="xml")
        items = soup.find_all('item')
        
        for i, item in enumerate(items):
            title = item.title.text
            link = item.link.text
            pubDate = item.pubDate.text if item.pubDate else ""

            try:
                article_res = requests.get(link, timeout=10)
                article_soup = BeautifulSoup(article_res.text, "html.parser")
                content = article_soup.select_one("article.fck_detail")
                content_text = content.get_text(separator="\n", strip=True) if content else ""

                if content_text:
                    print(f"[{category}] ✅ Bài {i+1}: {title}")
                    articles.append({
                        "category": category,
                        "title": title,
                        "url": link,
                        "published": pubDate,
                        "content": content_text[:10000]  # Giới hạn 10,000 ký tự để tránh Excel lỗi
                    })
                time.sleep(random.uniform(0.5, 1.0))
            except Exception as e:
                print(f"❌ Lỗi khi đọc bài viết: {title} - {e}")
                continue

    except Exception as e:
        print(f"❌ Không thể truy cập RSS {category}: {e}")

# Lưu ra file Excel
df = pd.DataFrame(articles)
timestamp = datetime.now().strftime("%Y%m%d_%H%M")
file_name = f"vnexpress_rss_articles_{timestamp}.xlsx"
df.to_excel(file_name, index=False, engine="openpyxl")

print(f"\n🎉 Đã lưu {len(df)} bài viết vào file: {file_name}")

