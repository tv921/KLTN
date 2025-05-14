import requests
from bs4 import BeautifulSoup
import time
import json
import pandas as pd

WIKI_API_URL = "https://vi.wikipedia.org/w/api.php"
WIKI_BASE_URL = "https://vi.wikipedia.org/wiki/"

def get_random_titles(limit=100):
    titles = []
    while len(titles) < limit:
        params = {
            "action": "query",
            "format": "json",
            "list": "random",
            "rnnamespace": 0,  # chỉ lấy bài viết chính
            "rnlimit": min(50, limit - len(titles))
        }
        res = requests.get(WIKI_API_URL, params=params)
        data = res.json()
        for item in data['query']['random']:
            titles.append(item['title'])
        time.sleep(1)
    return titles

def get_extract_and_link(title):
    params = {
        "action": "query",
        "format": "json",
        "prop": "extracts",
        "exintro": True,
        "explaintext": True,
        "titles": title
    }
    res = requests.get(WIKI_API_URL, params=params)
    data = res.json()
    page = next(iter(data['query']['pages'].values()))
    extract = page.get('extract', '')
    link = f"{WIKI_BASE_URL}{title.replace(' ', '_')}"
    return extract, link

def get_content_from_html(link):
    try:
        res = requests.get(link)
        soup = BeautifulSoup(res.text, 'html.parser')
        content_div = soup.find("div", {"id": "mw-content-text"})
        if content_div:
            return content_div.get_text(separator="\n", strip=True)
        else:
            return ""
    except Exception as e:
        return ""

def scrape_articles(limit=100):
    results = []
    titles = get_random_titles(limit)

    for i, title in enumerate(titles, 1):
        extract, link = get_extract_and_link(title)
        content = get_content_from_html(link)

        results.append({
            "title": title,
            "extract": extract,
            "content": content,
            "link": link
        })
        print(f"[{i}/{limit}] Done: {title}")
        time.sleep(0.5)  # tránh bị chặn

    return results

# === CHẠY VÀ LƯU VÀO FILE ===
if __name__ == "__main__":
    articles = scrape_articles(100)
    with open("wikipedia_vi_articles.json", "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    df = pd.DataFrame(articles)
    df.to_excel("wikipedia_vi_articles.xlsx", index=False, engine='openpyxl')
    print("✅ Đã lưu vào wikipedia_vi_articles.xlsx")



