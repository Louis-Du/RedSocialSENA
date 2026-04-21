# 🚀 GUÍA DE EJECUCIÓN Y PRUEBA CON FIREBASE

## Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Firebase](#configuración-de-firebase)
3. [Ejecución Local](#ejecución-local)
4. [Prueba con Múltiples Dispositivos](#prueba-con-múltiples-dispositivos)
5. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Software Necesario
- **Python 3.6+** (para servidor HTTP)
- **Git** (para clonar/actualizar)
- **Navegadores modernos**: Chrome, Edge, Firefox, Safari
- **Una cuenta Google** (para Firebase Console)

### Verificar Instalación
```bash
python3 --version
git --version
```

---

## Configuración de Firebase

### Paso 1: Crear Proyecto en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Hacer clic en **"Crear Proyecto"**
3. Nombre del proyecto: `red-social-sena` (o similar)
4. Seleccionar región
5. Aceptar términos y crear

### Paso 2: Obtener Credenciales

1. En el proyecto, ir a **⚙️ Configuración del Proyecto**
2. Bajar a **"Aplicaciones"**
3. Hacer clic en **</> WEB**
4. Copiar el objeto `firebaseConfig`
5. Pegar en `prototipo/js/firebase-config.js`

**Ejemplo de firebase-config.js:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDDdv_FCtIjxsAuJN47BA7MFWxojcDC2UU",
    authDomain: "red-social-sena.firebaseapp.com",
    projectId: "red-social-sena",
    storageBucket: "red-social-sena.firebasestorage.app",
    messagingSenderId: "925556760743",
    appId: "1:925556760743:web:95e0a567e50c8bb2b77b82",
    measurementId: "G-ZC9RHV7PW3"
};
```

### Paso 3: Habilitar Servicios de Firebase

#### ✅ Authentication (Autenticación)
1. Ir a **Authentication**
2. Pestaña **Sign-in method**
3. Habilitar **Email/Password**
4. Guardar

#### ✅ Firestore Database
1. Ir a **Firestore Database**
2. Hacer clic en **Crear base de datos**
3. Seleccionar modo de seguridad: **Modo de prueba** (para desarrollo)
4. Ubicación: Mantener por defecto
5. Crear

#### ✅ Storage (para imágenes)
1. Ir a **Storage**
2. Hacer clic en **Comenzar**
3. Modo de seguridad: **Comenzar en modo de prueba**
4. Ubicación: Por defecto
5. Crear

### Paso 4: Configurar Reglas de Firestore (Seguridad)

En **Firestore → Reglas**, reemplazar con:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura para usuarios autenticados
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null;
    }
    
    match /posts/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /comments/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /chats/{document=**} {
      allow read: if request.auth != null && request.auth.uid in resource.data.participants;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Ejecución Local

### Opción 1: Usar Script Incluido (Recomendado)

```bash
# Navegar a la carpeta
cd /home/luisdue/repos/RedSocialSena/prototipo

# Hacer ejecutable el script
chmod +x start_server.sh

# Ejecutar
./start_server.sh
```

**Salida esperada:**
```
=== Iniciando servidor HTTP en puerto 8080 ===
URL: http://127.0.0.1:8080/index.html
Presiona Ctrl+C para detener
Serving HTTP on 127.0.0.1 port 8080 ...
```

### Opción 2: Usar Python Directamente

```bash
cd /home/luisdue/repos/RedSocialSena/prototipo
python3 -m http.server 8080 --bind 127.0.0.1
```

### Opción 3: Desde Otros Puertos

Si el puerto 8080 está ocupado:

```bash
python3 -m http.server 3000 --bind 0.0.0.0
python3 -m http.server 5000 --bind 0.0.0.0
```

---

## Prueba con Múltiples Dispositivos

### 🖥️ Desde el Mismo Computador

#### 1. Abrir en Navegadores Diferentes
```
Chrome:  http://localhost:8080/index.html
Firefox: http://localhost:8080/index.html
Safari:  http://localhost:8080/index.html
Edge:    http://localhost:8080/index.html
```

#### 2. Usar DevTools para Simular Dispositivos
- Abre DevTools: `F12` o `Ctrl+Shift+I`
- Pestaña **Device Toggle** o icono 📱
- Seleccionar dispositivo (iPhone, Android, iPad, etc.)

### 📱 Desde Dispositivos Diferentes en la Misma Red

#### Paso 1: Identificar IP de tu Computador

**En Linux/Mac:**
```bash
# Opción 1
ifconfig | grep "inet "

# Opción 2 (más simple)
hostname -I

# Opción 3
ip addr show | grep "inet "
```

**En Windows:**
```bash
ipconfig
```

**Resultado esperado:**
```
192.168.1.100     # ← Esta es la IP local
```

#### Paso 2: Ejecutar Servidor en Todos los Interfaces

```bash
cd prototipo
python3 -m http.server 8080 --bind 0.0.0.0
```

#### Paso 3: Acceder desde Dispositivo Externo

**En el móvil/tablet (misma red WiFi):**
```
https://192.168.1.100:8080/index.html
```

**Reemplazar:**
- `192.168.1.100` con tu IP
- `8080` con el puerto que uses

### 🌐 Pruebas Reales (Desde Internet)

#### Opción 1: Usar ngrok (Recomendado)

```bash
# Instalar ngrok
# Desde https://ngrok.com/download

# En terminal 1: Ejecutar servidor local
cd prototipo
python3 -m http.server 8080

# En terminal 2: Crear tunel público
ngrok http 8080
```

**Salida:**
```
Forwarding   https://abc123.ngrok.io → http://localhost:8080
```

Luego compartir: `https://abc123.ngrok.io/index.html`

#### Opción 2: Usar GitHub Pages (Deployment)

```bash
# Hacer build si es necesario
# Luego pushear a GitHub

git add .
git commit -m "Actualizar con Firebase"
git push origin main
```

Acceso: `https://louis-du.github.io/RedSocialSENA/`

---

## Flujo de Prueba Completo

### 1. Verificar Credenciales
```javascript
// Abre DevTools (F12) → Console
console.log(auth.app.options.projectId)
```

Debería mostrar: `red-social-sena` (tu proyecto)

### 2. Crear Cuenta de Prueba

**Usuario 1 - Dispositivo A:**
- Tipo Doc: `CC`
- Documento: `12345678`
- Contraseña: `123456`

Hacer clic en **"Registrarse"**

**Usuario 2 - Dispositivo B:**
- Tipo Doc: `TI`
- Documento: `87654321`
- Contraseña: `123456`

Hacer clic en **"Registrarse"**

### 3. Probar Funcionalidades en Tiempo Real

#### Chat Privado (Usuario A → Usuario B)
1. Usuario A: Click en Chat
2. Crear chat privado con Usuario B
3. Enviar mensaje: "Hola desde dispositivo A"
4. **Resultado esperado**: Usuario B ve el mensaje instantáneamente ✅

#### Posts y Comentarios
1. Usuario A: Crear publicación
2. Usuario B: Ver publicación
3. Usuario B: Comentar
4. User A: Ver comentario en tiempo real ✅

#### Likes/Reacciones
1. Usuario A: Likeear post de User B
2. Usuario B: Ver actualización en tiempo real ✅

---

## Troubleshooting

### ❌ "Firebase is not defined"

**Causa:** Firebase no se cargó correctamente

**Solución:**
```javascript
// Verificar en DevTools → Console
console.log(firebase)
console.log(window.firebase)

// Si aparece error, revisar:
// 1. firebase-config.js existe y está correctamente configurado
// 2. Las credenciales son válidas
// 3. El proyecto existe en Firebase Console
```

### ❌ "No user authenticated"

**Causa:** usuario no registrado o credenciales incorrectas

**Solución:**
```bash
# En Firebase Console → Authentication
# Verificar que el usuario existe con las credenciales correctas

# El email SINTÉTICO se genera así:
# CC_12345678@redsocialsena.local
```

### ❌ "Permission denied: Missing or insufficient permissions"

**Causa:** Reglas de Firestore no están correctamente configuradas

**Solución:**
1. Ir a Firestore → Reglas
2. Verificar que estén habilitadas para lectura/escritura
3. Para DESARROLLO: Usar modo "Modo de prueba" (public)

### ❌ "CORS error en chat"

**Causa:** Imágenes de Storage tienen restricciones

**Solución:**
```bash
# En Firebase Console → Storage → Reglas
allow read, write: if request.auth != null;
```

### ❌ No sincroniza entre dispositivos

**Causa:** Dispositivos en diferentes redes o fallos de conexión

**Solución:**
```bash
# 1. Verificar conectividad
ping google.com

# 2. Verificar que Firebase está inicializado
# DevTools → Console → firebase.auth().currentUser

# 3. Revisar Network tab (F12 → Network)
# Buscar peticiones a firestore.googleapis.com
```

---

## Comandos Útiles

### Monitorear Servidor
```bash
# Ver requests en tiempo real
python3 -m http.server 8080 --bind 0.0.0.0 2>&1 | tee server.log
```

### Limpiar Cache del Navegador
```bash
# En DevTools (F12)
# Application → Cookies → Seleccionar dominio → Delete all
# Application → Local Storage → Limpiar
```

### Encontrar IP en Red Local
```bash
# Linux/Mac
hostname -I

# Windows
ipconfig /all | findstr IPv4
```

---

## Checklist de Configuración ✅

- [ ] Crear proyecto en Firebase Console
- [ ] Copiar credenciales a `firebase-config.js`
- [ ] Habilitar Authentication (Email/Password)
- [ ] Crear Firestore Database (Modo prueba)
- [ ] Habilitar Storage
- [ ] Configurar reglas de seguridad
- [ ] Ejecutar servidor local (`python3 -m http.server 8080`)
- [ ] Acceder a `http://localhost:8080/index.html`
- [ ] Crear cuentas de prueba
- [ ] Probar funcionalidades en tiempo real
- [ ] Pruebar desde múltiples dispositivos

---

## Próximos Pasos

1. **Optimizar para Producción**
   ```bash
   npm run build:css  # Compilar Tailwind
   ```

2. **Deployer a GitHub Pages**
   ```bash
   git push origin main
   # Ver en: https://louis-du.github.io/RedSocialSENA/
   ```

3. **Configurar dominio personalizado**
   - Ir a GitHub → Settings → Pages
   - Agregar dominio personalizado

---

**¿Preguntas?** Revisa la consola del navegador (F12) para ver mensajes de error detallados.
