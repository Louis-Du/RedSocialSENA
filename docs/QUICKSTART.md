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

---
# 🚀 COMIENZA YA - 3 Pasos Simples

## Paso 1: Configurar Firebase (2 minutos)

```bash
# 1.1. Abrir terminal
cd /home/luisdue/repos/RedSocialSena/prototipo/js

# 1.2. Verificar archivo existe
ls firebase-config.example.js

# 1.3. Copiar example -> real
cp firebase-config.example.js firebase-config.js

# 1.4. Editar con tus credenciales
nano firebase-config.js
# O abrir en VS Code: code firebase-config.js
```

### Dentro de firebase-config.js
Reemplaza esto:
```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    ...
}
```

Con tus credenciales reales de [Firebase Console](https://console.firebase.google.com)

---

## Paso 2: Ejecutar Servidor (1 comando)

### Opción A: LOCAL (solo tu PC)
```bash
cd /home/luisdue/repos/RedSocialSena/prototipo
python3 -m http.server 8080 --bind 127.0.0.1
```

**Luego abrir:** `http://127.0.0.1:8080/index.html` en navegador

### Opción B: RED (múltiples dispositivos)
```bash
cd /home/luisdue/repos/RedSocialSena/prototipo
python3 -m http.server 8080 --bind 0.0.0.0
```

**Encontrar tu IP:**
```bash
hostname -I
# Resultado: 192.168.1.100 (por ejemplo)
```

**Luego abrir en otro dispositivo:** `http://192.168.1.100:8080/index.html`

---

## Paso 3: Probar y Disfrutar ✅

### En el navegador:
1. Click en **"Registrarse"**
2. Llenar form:
   - Tipo: `CC`
   - Documento: `12345678`
   - Contraseña: `123456`
3. ¡Listo! Estás dentro

### Pruebas básicas:
- ✅ Crear publicación
- ✅ Ver en otro dispositivo
- ✅ Comentar
- ✅ Chat privado
- ✅ Likes

---

## 📱 Para Múltiples Dispositivos

1. **Servidor ejecutándose** en terminal (paso 2, opción B)
2. **Encontrar IP** con `hostname -I`
3. **Abrir en móvil** o tablet: `http://[TU_IP]:8080/index.html`
4. **Registrar usuarios diferentes** en cada dispositivo
5. **¡Probar!** Enviar mensajes, comentarios, etc.

---

## 🆘 Si Falla

### "Firebase is not defined"
- Verificar `firebase-config.js` tiene credenciales reales
- No debe tener "TU_API_KEY_AQUI"

### "Port 8080 already in use"
```bash
# Usar otro puerto
python3 -m http.server 3000 --bind 0.0.0.0
```

### "Credenciales incorrectas"
- Ir a Firebase Console
- Copiar credenciales nuevamente
- Pegar en `firebase-config.js`

### "Otros dispositivos no pueden conectar"
- Asegurar que están en **MISMO WiFi**
- Usar `--bind 0.0.0.0` en el servidor
- Verificar firewall no bloquea puerto 8080

---

## 📖 Documentación Completa

- **Inicio Rápido:** [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)
- **Guía Completa:** [GUIA_EJECUCION_FIREBASE.md](./GUIA_EJECUCION_FIREBASE.md)
- **Comandos y Troubleshooting:** [COMANDOS_Y_TROUBLESHOOTING.md](./COMANDOS_Y_TROUBLESHOOTING.md)
- **Plan de Pruebas:** [PLAN_PRUEBAS_FIREBASE.md](./PLAN_PRUEBAS_FIREBASE.md)

---

¿Listo? **Comienza con el Paso 1** ✨
