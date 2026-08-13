import os
os.environ['PEXELS_API_KEY'] = 'Uk11979lXyRGJX8Meg9JMeVVhXaa3ja4WNHGM8QsuOODVQ9LmcB6qAtp'

from api.services.stock_fetcher import search_videos, download_file, CACHE_DIR

print("CACHE_DIR:", CACHE_DIR)
print("Key set:", bool(os.environ.get("PEXELS_API_KEY")))

videos = search_videos("sunrise", count=1, orientation="portrait")
print(f"Found: {len(videos)} videos")
if videos:
    v = videos[0]
    url = v.get("url", "")
    placeholder = v.get("placeholder", False)
    print(f"URL: {url[:80]}")
    print(f"Placeholder: {placeholder}")
    if not placeholder and url:
        path = download_file(url, "debug_test.mp4")
        exists = os.path.exists(path)
        size = os.path.getsize(path) if exists else 0
        print(f"Path: {path}")
        print(f"Exists: {exists}, Size: {size // 1024}KB")
