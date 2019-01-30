#!/usr/bin/env python3
import os
import sys
import requests
import codecs
import json
from pprint import pprint

print('[', file=open("id.json", "w"))
r = requests.post("http://localhost:7512/nyc-open-data/yellow-taxi/_create", data={"user":"yo","pwd":"kk"})
print(r.status_code, r.reason)
print(r.text, file=open("id.json", "a"))
print(']', file=open("id.json", "a"))

with open('id.json') as f:
    data = json.load(f)

print([data["result"]["_id"] for data in data], file=open("id.txt", "w"))
content = codecs.open('id.txt', encoding='utf-8').read()
content = content[:-1]
print(content.replace('\'', '').replace(']', '').replace('[',''), file=open("id.txt", "w"))
os.remove("id.json")
