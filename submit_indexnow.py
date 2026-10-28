#!/usr/bin/env python3
"""
submit_indexnow.py — Automated Bing & Search Engine IndexNow Submitter
Reads all canonical URLs from sitemap.xml and submits them to IndexNow API.
"""
import sys
import json
import xml.etree.ElementTree as ET
import urllib.request
import urllib.error
import pathlib

HOST = "mathacademydarsana.vercel.app"
KEY = "bc14bb9c7dc34ee3818627cbec856bfe"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

def get_sitemap_urls():
    root_dir = pathlib.Path(__file__).parent.resolve()
    sitemap_path = root_dir / "sitemap.xml"
    if not sitemap_path.exists():
        sitemap_path = root_dir / "dist" / "sitemap.xml"
    
    if not sitemap_path.exists():
        return [f"https://{HOST}/"]
    
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        urls = [
            elem.text.strip()
            for elem in root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
            if elem.text and elem.text.strip()
        ]
        return urls if urls else [f"https://{HOST}/"]
    except Exception as e:
        print(f"[IndexNow] Error parsing sitemap: {e}", file=sys.stderr)
        return [f"https://{HOST}/"]

def submit_indexnow():
    urls = get_sitemap_urls()
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls
    }

    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=data,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "IndexNow-Submitter/1.0"
        },
        method="POST"
    )

    print("=========================================")
    print("   Bing IndexNow URL Submission")
    print("=========================================")
    print(f"Host: {HOST}")
    print(f"Key: {KEY}")
    print(f"KeyLocation: {KEY_LOCATION}")
    print(f"Submitting {len(urls)} URLs to {INDEXNOW_ENDPOINT}...")
    for u in urls:
        print(f" - {u}")

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            status = res.status
            print(f"\n[SUCCESS] IndexNow returned HTTP {status}")
            if status in (200, 202):
                print("[SUCCESS] URLs successfully accepted by IndexNow engine!")
            return True
    except urllib.error.HTTPError as e:
        print(f"\n[HTTP ERROR] IndexNow responded with {e.code}: {e.reason}", file=sys.stderr)
        try:
            body = e.read().decode("utf-8", errors="ignore")
            print(f"Response body: {body}", file=sys.stderr)
        except Exception:
            pass
        return False
    except Exception as e:
        print(f"\n[ERROR] Network error during submission: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    success = submit_indexnow()
    sys.exit(0 if success else 1)
