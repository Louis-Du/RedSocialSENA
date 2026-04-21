#!/bin/bash

# 🚀 SCRIPT DE DESARROLLO - Red Social SENA
# Ejecuta: chmod +x dev.sh && ./dev.sh

set -e  # Detener si hay error

PROTOTIPO_DIR="$(cd "$(dirname "$0")/prototipo" && pwd)"
PORT=${1:-8080}
BIND=${2:-0.0.0.0}

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🚀 Red Social SENA - Servidor de Desarrollo            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Verificar que firebase-config.js existe
if [ ! -f "$PROTOTIPO_DIR/js/firebase-config.js" ]; then
    echo "⚠️  ADVERTENCIA: firebase-config.js no encontrado"
    echo ""
    echo "Pasos para configurar Firebase:"
    echo ""
    echo "1. Crear proyecto en: https://console.firebase.google.com"
    echo ""
    echo "2. Copiar firebase-config.js:"
    echo "   cp prototipo/js/firebase-config.example.js prototipo/js/firebase-config.js"
    echo ""
    echo "3. Editar prototipo/js/firebase-config.js con tus credenciales"
    echo ""
    echo "4. Ejecutar este script nuevamente"
    echo ""
    exit 1
fi

echo "📁 Directorio: $PROTOTIPO_DIR"
echo "🔌 Puerto: $PORT"
echo "🌐 Bind: $BIND"
echo ""

# Detectar IP local
echo "🔍 IPs locales disponibles:"
echo ""
if command -v hostname &> /dev/null; then
    echo "  Localhost:    http://127.0.0.1:$PORT/index.html"
    echo "  Local Network: http://$(hostname -I | awk '{print $1}'):$PORT/index.html"
else
    echo "  Localhost:    http://127.0.0.1:$PORT/index.html"
fi
echo ""

# Detectar si python3 está disponible
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 no encontrado"
    echo "   Instalar con: sudo apt install python3"
    exit 1
fi

echo "✅ Iniciando servidor HTTP en puerto $PORT..."
echo "   Presiona Ctrl+C para detener"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROTOTIPO_DIR"

# Ejecutar servidor
if [ "$BIND" = "0.0.0.0" ]; then
    echo "⚠️  Servidor accesible desde cualquier interfaz de red"
    echo "   Se accesible para otros dispositivos en tu red WiFi"
    echo ""
fi

python3 -m http.server $PORT --bind $BIND
