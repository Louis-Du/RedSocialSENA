#!/bin/bash

# 📖 GUÍA RÁPIDA - Comandos de Ejecución
# Este archivo documenta los comandos más comunes

set -e

PROTOTIPO_DIR="$(cd "$(dirname "$0")/prototipo" && pwd)"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  📚 GUÍA RÁPIDA DE EJECUCIÓN                             ║"
echo "║     Red Social SENA + Firebase                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Mostrar opciones
echo "Selecciona cómo quieres ejecutar:"
echo ""
echo "  1) Servidor LOCAL (127.0.0.1:8080) - Solo este computador"
echo "  2) Servidor en TODAS las redes (0.0.0.0:8080) - Múltiples dispositivos"
echo "  3) Servidor en PUERTO PERSONALIZADO"
echo "  4) Ver instrucciones COMPLETAS"
echo "  5) Salir"
echo ""
read -p "Elige opción (1-5): " option

case $option in
    1)
        echo ""
        echo "▶️  Iniciando servidor LOCAL..."
        echo "   Accesible en: http://127.0.0.1:8080/index.html"
        echo ""
        cd "$PROTOTIPO_DIR"
        python3 -m http.server 8080 --bind 127.0.0.1
        ;;
    2)
        echo ""
        echo "▶️  Iniciando servidor en TODAS las redes..."
        echo "   Accesible desde otros dispositivos WiFi"
        echo ""
        
        # Mostrar IPs disponibles
        if command -v hostname &> /dev/null; then
            IP=$(hostname -I | awk '{print $1}')
            echo "   Tu IP local: http://$IP:8080/index.html"
        fi
        echo ""
        
        cd "$PROTOTIPO_DIR"
        python3 -m http.server 8080 --bind 0.0.0.0
        ;;
    3)
        echo ""
        read -p "Puerto (default 8080): " port
        port=${port:-8080}
        echo ""
        echo "▶️  Iniciando servidor en puerto $port..."
        echo "   Accesible en: http://127.0.0.1:$port/index.html"
        echo ""
        cd "$PROTOTIPO_DIR"
        python3 -m http.server $port --bind 0.0.0.0
        ;;
    4)
        echo ""
        cat << 'EOF'

════════════════════════════════════════════════════════════════

📋 INSTRUCCIONES COMPLETAS

1️⃣  PRIMERO: Configurar Firebase

    a) Ir a: https://console.firebase.google.com
    b) Crear un proyecto nuevo
    c) Copiar credenciales
    d) Editar: prototipo/js/firebase-config.js
    e) Pegar credenciales en firebaseConfig

2️⃣  EJECUTAR SERVIDOR LOCAL

    cd prototipo
    python3 -m http.server 8080 --bind 127.0.0.1

    Luego abrir en navegador: http://127.0.0.1:8080/index.html

3️⃣  PRUEBAS CON MÚLTIPLES DISPOSITIVOS (MISMO WIFI)

    # Terminal 1: Ejecutar servidor con -bind 0.0.0.0
    cd prototipo
    python3 -m http.server 8080 --bind 0.0.0.0

    # Encontrar tu IP:
    hostname -I

    # En otro dispositivo (teléfono tablet):
    http://192.168.1.100:8080/index.html
    (reemplaza 192.168.1.100 con tu IP)

4️⃣  CREAR CUENTAS DE PRUEBA

    Usuario 1:
    - Tipo: CC
    - Documento: 12345678
    - Contraseña: 123456

    Usuario 2:
    - Tipo: TI
    - Documento: 87654321
    - Contraseña: 123456

5️⃣  PROBAR EN TIEMPO REAL

    ✅ Crear publicación (Usuario 1)
    ✅ Ver en tiempo real (Usuario 2)
    ✅ Comentar (Usuario 2)
    ✅ Chat privado entre usuarios
    ✅ Likes/Reacciones

════════════════════════════════════════════════════════════════

📱 NGROK (Para pruebas desde internet)

    # Instalar: https://ngrok.com/download

    # Terminal 1:
    python3 -m http.server 8080

    # Terminal 2:
    ngrok http 8080

    # Copiar URL https://abc123.ngrok.io/index.html

════════════════════════════════════════════════════════════════
EOF
        ;;
    5)
        echo "Adiós 👋"
        exit 0
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac
