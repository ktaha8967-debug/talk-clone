import os
os.environ['PEXELS_API_KEY'] = 'Uk11979lXyRGJX8Meg9JMeVVhXaa3ja4WNHGM8QsuOODVQ9LmcB6qAtp'

from api.services.stock_fetcher import search_videos, download_file

print("Testing Pexels API...")
results = search_videos("sunrise mountains", count=2, orientation="portrait")
print(f"Found {len(results)} videos")
for r in results:
    pid = r.get("placeholder", False)
    print(f"  ID: {r['id']}, URL: {r['url'][:80] if r['url'] else 'EMPTY'}..., Placeholder: {pid}")
    if not pid and r["url"]:
        path = download_file(r["url"], f"test_stock_{r['id']}.mp4")
        exists = os.path.exists(path)
        size = os.path.getsize(path) if exists else 0
        print(f"  Downloaded: {exists}, Size: {size} bytes")
