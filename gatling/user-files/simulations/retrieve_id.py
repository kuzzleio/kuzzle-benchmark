#!/usr/bin/env python3
import os
import sys
import requests
import codecs
import json
from pprint import pprint

if len(sys.argv) < 2:
    print("Please precise how many files to be created")
    exit()

i = 0
print('[', file=open("ids.json", "w"))
while i < int(sys.argv[1]):
    r = requests.post("http://localhost:7512/nyc-open-data/yellow-taxi/_create", data={"user":"yo","pwd":"kk"})
    print(r.status_code, r.reason)
    print(r.text, file=open("ids.json", "a"))
    if i + 1 < int(sys.argv[1]):
        print(',', file=open("ids.json", "a"))
    i += 1
print(']', file=open("ids.json", "a"))

with open('ids.json') as f:
    data = json.load(f)

print([data["result"]["_id"] for data in data], file=open("ids.txt", "w"))
content = codecs.open('ids.txt', encoding='utf-8').read()
print(content.replace('\'', '\"'), file=open("ids.txt", "w"))
os.remove("ids.json")
