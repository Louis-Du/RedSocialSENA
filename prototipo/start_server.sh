#!/bin/bash
cd "$(dirname "$0")"
echo "=== Iniciando servidor HTTP en puerto 8080 ==="
echo "URL: http://127.0.0.1:8080/index.html"
echo "Presiona Ctrl+C para detener"
python3 -m http.server 8080 --bind 127.0.0.1
