#!/usr/bin/env python3
from PIL import Image
import os

BASE = os.path.join(os.path.dirname(__file__), '..')
IMAGES = [
    os.path.join(BASE, 'assets/noticias/noticia1.png'),
    os.path.join(BASE, 'assets/noticias/noticia2.png'),
]

for p in IMAGES:
    p = os.path.normpath(p)
    if not os.path.exists(p):
        print(f"SKIP: not found: {p}")
        continue
    try:
        with Image.open(p) as im:
            im = im.convert('RGB')
            out = os.path.splitext(p)[0] + '.webp'
            im.save(out, 'WEBP', quality=85, method=6)
            print(f"Saved: {out}")
    except Exception as e:
        print(f"ERROR processing {p}: {e}")
