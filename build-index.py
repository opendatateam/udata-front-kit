"""
Build a search index from data.gouv.fr's API
"""
import json

import requests
import yaml

from lunr import lunr


with open("config.yaml") as f:
    data = yaml.safe_load(f)

base_url = data["datagouvfr_api_url"]
organizations = data["organizations"]


def get(url):
    r = requests.get(url)
    r.raise_for_status()
    return r.json()


datasets = []

for org in organizations:
    try:
        print(f"Fetching {org}...")
        url = f"{base_url}/1/organizations/{org}/datasets/"
        data = get(url)
        datasets += data["data"]
        while next := data["next_page"]:
            data = get(next)
            datasets += data["data"]
    except Exception as e:
        print(f"[ERROR] {org}: {e}")

idx = lunr(
    ref="id", fields=("title", "description"), documents=datasets
)

sidx = idx.serialize()
with open("idx.json", "w") as f:
    json.dump(sidx, f)
