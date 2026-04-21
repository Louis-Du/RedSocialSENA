# 🎯 INICIO RÁPIDO - Red Social SENA + Firebase

## ⚡ En 5 Minutos

### 1️⃣ Configurar Firebase (Primera vez)

```bash
# Ir a https://console.firebase.google.com
# Crear proyecto → Obtener credenciales → Copiar en firebase-config.js

cp prototipo/js/firebase-config.example.js prototipo/js/firebase-config.js
# Editar firebase-config.js con tus credenciales reales
```

### 2️⃣ Ejecutar Servidor

**Opción A (Recomendada - Interfaz interactiva):**
```bash
chmod +x guia-rapida.sh
./guia-rapida.sh
# Luego seleccionar opción 1 o 2
```

**Opción B (Línea de comandos):**
```bash
cd prototipo
python3 -m http.server 8080 --bind 127.0.0.1
```

### 3️⃣ Abrir en Navegador

```
http://127.0.0.1:8080/index.html
```

### 4️⃣ Crear Cuentas de Prueba y Probar

- Hacer clic en **"Registrarse"**
- Ingresar: Tipo (CC), Documento (12345678), Contraseña (123456)
- Crear publicación, comentar, chatear

---

## 📱 Múltiples Dispositivos (Mismo WiFi)

### Terminal 1: Ejecutar servidor
```bash
cd prototipo
python3 -m http.server 8080 --bind 0.0.0.0
```

### Terminal 2: Encontrar tu IP
```bash
hostname -I
# Output: 192.168.1.100 (ejemplo)
```

### En otro dispositivo (móvil, tablet)
```
http://192.168.1.100:8080/index.html
```

Reemplaza `192.168.1.100` con tu IP real.

---

## 🌐 Pruebas desde Internet (ngrok)

```bash
# Terminal 1: Servidor
python3 -m http.server 8080

# Terminal 2: Túnel público
ngrok http 8080
# Output: https://abc123.ngrok.io
```

Compartir: `https://abc123.ngrok.io/index.html`

---

## 📋 Funcionalidades a Probar

En **dispositivos diferentes**:

- [ ] Usuario A se registra
- [ ] Usuario B se registra
- [ ] Usuario A crea publicación
- [ ] Usuario B ve publicación en tiempo real
- [ ] Usuario B comenta
- [ ] Usuario A ve comentario en tiempo real
- [ ] Usuario A inicia chat privado
- [ ] Usuario B ve chat
- [ ] Enviar mensajes bidireccionales
- [ ] Enviar y ver imágenes en chat

---

## 🐛 Si No Funciona

### "Firebase is not defined"
```javascript
// Verificar en DevTools (F12):
console.log(firebase)
// Debe mostrar objeto, no error
```

### "Permission denied"
Ir a **Firebase Console → Firestore → Reglas** y usar modo "Prueba"

### No sincroniza entre dispositivos
- Verificar que están en **misma red WiFi**
- Revisar DevTools → Network
- Buscar errores en Console

---

## 📖 Documentación Completa

Ver: [GUIA_EJECUCION_FIREBASE.md](./GUIA_EJECUCION_FIREBASE.md)

---

## 🚀 Próximo Paso

Una vez verificado con Firebase:
1. Deployer a GitHub Pages: `git push origin main`
2. Acceder: `https://louis-du.github.io/RedSocialSENA/`

---

¿Preguntas? Abre DevTools con F12 y revisa la consola para errores específicos.
