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

---
# 🧪 PLAN DE PRUEBAS - Firebase + Múltiples Dispositivos

## 🎯 Objetivo
Verificar que todas las funcionalidades funcionan en tiempo real con Firebase cuando múltiples usuarios acceden desde dispositivos diferentes.

---

## 📋 Preparación

### Requisitos
- [ ] 2 o más dispositivos en la misma red WiFi (o misma computadora en navegadores distintos)
- [ ] Firebase configurado y funcionando
- [ ] Servidor ejecutándose: `python3 -m http.server 8080 --bind 0.0.0.0`
- [ ] IP local disponible (ej: 192.168.1.100)

### Cuentas de Prueba Necesarias

| Usuario | Tipo Doc | Documento | Contraseña |
|---------|----------|-----------|-----------|
| Alice   | CC       | 10000001  | Test@123  |
| Bob     | TI       | 20000002  | Test@123  |
| Carlos  | CE       | 30000003  | Test@123  |

---

## 🧪 Test 1: Autenticación Cross-Device ✅

### Objetivo: Verificar login simultáneo

**Paso 1: Alice (Dispositivo A)**
```
URL: http://192.168.1.100:8080/index.html
1. Click en "Registrarse"
2. Tipo: CC | Documento: 10000001 | Contraseña: Test@123
3. Click crear cuenta
```

**Resultado esperado:**
- ✅ Se registra exitosamente
- ✅ Ve su perfil con nombre "Alice"
- ✅ Acceso al feed

**Paso 2: Bob (Dispositivo B)**
```
URL: http://192.168.1.100:8080/index.html
1. Click en "Registrarse"
2. Tipo: TI | Documento: 20000002 | Contraseña: Test@123
3. Click crear cuenta
```

**Resultado esperado:**
- ✅ Bob se registra sin conflictos
- ✅ Alice sigue logueada en Dispositivo A
- ✅ Ambos ven el feed

---

## 🧪 Test 2: Publicaciones en Tiempo Real 📝

### Objetivo: Ver actualización instantánea de posts

**Paso 1: Alice crea publicación**
```
Dispositivo A (Alice)
1. Click en "Crear publicación"
2. Escribir: "¡Hola desde Alice en el dispositivo A!"
3. Click "Publicar"
```

**Paso 2: Bob ve publicación**
```
Dispositivo B (Bob)
1. Esperar 1-2 segundos
2. Verificar que aparece post de Alice en el feed
3. Verificar que dice: "¡Hola desde Alice en el dispositivo A!"
4. Verificar nombre "Alice" y foto
```

**Resultado esperado:**
- ✅ Post aparece en tiempo real (< 2 segundos)
- ✅ Información del autor correcta
- ✅ Timestamp correcto

### Test 2b: Publicación con Imagen

**Paso 1: Bob crea post con imagen**
```
Dispositivo B
1. Click "Crear publicación"
2. Escribir: "Publicación con imagen"
3. Click "Subir Imagen"
4. Seleccionar foto desde dispositivo
5. Click "Publicar"
```

**Paso 2: Alice ve publicación con imagen**
```
Dispositivo A
1. Esperar actualización
2. Verificar que imagen se ve correctamente
3. Hacer click en imagen (debe ampliar)
```

**Resultado esperado:**
- ✅ Imagen sube correctamente
- ✅ Se ve en tiempo real en otro dispositivo
- ✅ Calidad y tamaño correctos

---

## 🧪 Test 3: Comentarios en Tiempo Real 💬

### Objetivo: Verificar interacción de comentarios

**Paso 1: Alice ve post de Bob, comenta**
```
Dispositivo A (Alice)
1. Buscar post de Bob
2. Hacer click en "Comentar"
3. Escribir: "¡Excelente foto Bob!"
4. Click enviar
```

**Paso 2: Bob ve comentario instantáneamente**
```
Dispositivo B (Bob)
1. Encuentra su post
2. Verifica que aparece comentario de Alice
3. Lee: "¡Excelente foto Bob!"
```

**Paso 3: Alice responde**
```
Dispositivo A
1. Bob responde: "¡Gracias Alice!"
2. Click enviar
```

**Paso 4: Bob ve respuesta**
```
Dispositivo B
1. Verifica que aparece respuesta de Bob
2. Total de comentarios actualizado
```

**Resultado esperado:**
- ✅ Comentarios aparecen en < 2 segundos
- ✅ Contador de comentarios actualiza
- ✅ Nombres y fotos correctas
- ✅ Orden cronológico correcto

---

## 🧪 Test 4: Chat Privado en Tiempo Real 💬

### Objetivo: Verificar mensajería privada

**Paso 1: Alice inicia chat con Bob**
```
Dispositivo A (Alice)
1. Click en "Chat"
2. Click en "Iniciar nuevo chat"
3. Buscar "Bob"
4. Click crear chat
```

**Paso 2: Bob ve chat en su lista**
```
Dispositivo B (Bob)
1. Click en "Chat"
2. Verificar que aparece "Alice" en lista de chats
3. Hacer click en Alice
```

**Paso 3: Alice envía mensaje**
```
Dispositivo A
1. Escribir: "Hola Bob, ¿cómo estás?"
2. Click enviar
```

**Paso 4: Bob recibe mensaje instantáneamente**
```
Dispositivo B
1. Esperar 1 segundo
2. Verificar que aparece mensaje: "Hola Bob, ¿cómo estás?"
3. Verificar que dice "Alice" como emisor
4. Ver timestamp
```

**Paso 5: Bob responde**
```
1. Escribir: "¡Hola Alice! Estoy bien, gracias"
2. Click enviar
```

**Paso 6: Alice recibe respuesta**
```
Dispositivo A
1. Verificar que aparece inmediatamente
2. Ver nombre "Bob"
3. Verificar que se marca como leído
```

**Resultado esperado:**
- ✅ Chat aparece en lista al instante
- ✅ Mensajes se sincronizan < 2 segundos
- ✅ Indicador de leído funciona
- ✅ Timestamps correctos
- ✅ Sin duplicados

### Test 4b: Chat con Imagen

**Paso 1: Alice envía imagen**
```
Dispositivo A
1. Hacer click en icono "📎 Imagen"
2. Seleccionar foto
3. Esperar a que suba
4. Verificar que se envía
```

**Paso 2: Bob recibe imagen**
```
Dispositivo B
1. Verificar que aparece imagen en chat
2. Hacer click para ampliar
3. Verificar que se ve correctamente
```

**Resultado esperado:**
- ✅ Imagen se sube correctamente
- ✅ Aparece en tiempo real
- ✅ Se puede ampliar/descargar

---

## 🧪 Test 5: Likes/Reacciones ❤️

### Objetivo: Verificar interacción de likes

**Paso 1: Bob likea post de Alice**
```
Dispositivo B (Bob)
1. Buscar publicación de Alice
2. Hacer click en el ❤️
3. Ver que el contador aumenta
```

**Paso 2: Alice ve el like instantáneamente**
```
Dispositivo A (Alice)
1. Ver su publicación
2. Verificar que contador de likes subió
3. Si hay lista de quienes likearon, ver "Bob"
```

**Paso 3: Alice likea post de Bob**
```
Dispositivo A
1. Encontrar post de Bob
2. Click en ❤️
```

**Paso 4: Bob ve actualización**
```
Dispositivo B
1. Verificar que su post ahora tiene +1 like
2. Ver que "Alice" likeó
```

**Resultado esperado:**
- ✅ Contador actualiza en tiempo real
- ✅ Lista de quienes likearon correcta
- ✅ Interface responde rápido

---

## 🧪 Test 6: Perfil de Otros Usuarios 👤

### Objetivo: Verificar visualización de perfiles

**Paso 1: Alice hace click en perfil de Bob**
```
Dispositivo A (Alice)
1. Encontrar publicación de Bob
2. Hacer click en nombre "Bob" o foto
3. Abrir perfil de Bob
```

**Resultado esperado:**
- ✅ Se abre perfil de Bob sin problemas
- ✅ Se muestran sus datos: programa, trimestre, etc.
- ✅ Se ven sus publicaciones (si hay)

**Paso 2: Bob hace cambios en su perfil**
```
Dispositivo B (Bob)
1. Click en "Perfil"
2. Editar: cambiar bio a "Desarrollador apasionado"
3. Click "Guardar"
```

**Paso 3: Alice ve cambios**
```
Dispositivo A
1. Click "Volver" y abrir perfil de Bob nuevamente
2. Verificar que bio se actualizó
```

**Resultado esperado:**
- ✅ Cambios aparecen al recargar
- ✅ Información sincronizada correctamente

---

## 🧪 Test 7: Sincronización Offline-Online

### Objetivo: Verificar que funciona al reconectar

**Paso 1: Bob "desconecta" (cerrar navegador)**
```
Dispositivo B (Bob)
1. Cerrar pestaña/navegador
2. (Simula desconexión)
```

**Paso 2: Alice sigue interactuando**
```
Dispositivo A (Alice)
1. Crear publicación
2. Comentar en posts
3. Enviar mensajes al chat
```

**Paso 3: Bob se "reconecta"**
```
Dispositivo B
1. Reabrir navegador
2. Ir a: http://192.168.1.100:8080
3. Loguearse como Bob
```

**Resultado esperado:**
- ✅ Todos los cambios se sincronizaron
- ✅ Mensajes de Alice están presente
- ✅ Publicaciones actualizadas
- ✅ No hay duplicados

---

## 🧪 Test 8: Escalabilidad (Opcional)

### Objetivo: Verificar con 3+ dispositivos

**Paso 1: Registrar a Carlos**
```
Dispositivo C (Carlos)
1. Registrarse como: CE | 30000003
2. Loguearse
```

**Paso 2: Todos se comunican**
```
Alice → Comenta en post de Bob
Bob → Envía chat a Alice
Carlos → Comenta en post de Alice
Alice → Ve todo en tiempo real
```

**Resultado esperado:**
- ✅ Sistema escala con 3+ usuarios
- ✅ Sin lag significativo
- ✅ Todos ven cambios

---

## 📊 REPORTE DE RESULTADOS

### Plantilla para documentar

```markdown
## Pruebas Completadas - [FECHA]

### Test 1: Autenticación ✅/❌
- Alice se registró: ✅
- Bob se registró: ✅

### Test 2: Publicaciones ✅/❌
- Alice crea post: ✅
- Bob ve en < 2s: ✅
- Con imagen: ✅

### Test 3: Comentarios ✅/❌
- Comentarios sincronizan: ✅
- Contador actualiza: ✅

### Test 4: Chat ✅/❌
- Chat privado funciona: ✅
- Mensajes en tiempo real: ✅
- Con imágenes: ✅

### Test 5: Likes ✅/❌
- Likes actualizan: ✅

### Test 6: Perfiles ✅/❌
- Ver perfil funciona: ✅
- Ver cambios: ✅

### Test 7: Offline/Online ✅/❌
- Reconexión sincroniza: ✅

### Problemas Encontrados
1. [Problema] - [Solución propuesta]
2. [Problema] - [Solución propuesta]

### Conclusión
✅ Sistema funcionando correctamente
```

---

## 🆘 Problemas Comunes Encontrados

| Problema | Síntoma | Solución |
|----------|---------|----------|
| Mensajes no sincronizan | No aparecen mensajes en otro dispositivo | Verificar conexión a internet, recargar página |
| Imágenes no carga | Imagen sube pero no aparece | Verificar permisos en Storage, conexión |
| Lag alto | Demora > 3 segundos | Revisar ancho de banda, reducir actividad |
| Duplicados | Mismo comentario aparece 2x | Limpiar cache, localStorage.clear() |
| Chat desaparece | No ve el chat después de cerrar | Verificar lista de chats se actualiza |

---

## ✅ ANTES DE DEPLOYER A PRODUCCIÓN

- [ ] Todos los tests pasaron ✅
- [ ] No hay errores en Console
- [ ] Funciona en dispositivos reales (móvil, tablet)
- [ ] Desempeño es aceptable (< 2s sincronización)
- [ ] Imágenes se cargan correctamente
- [ ] Chat es bidireccional
- [ ] Offline/online maneja correctamente
- [ ] README y documentación actualizados

---

## 📱 DISPOSITIVOS RECOMENDADOS PARA PRUEBAS

Usando **múltiples navegadores en el mismo PC:**
- Chrome Dev
- Firefox (diferente usuario)
- Edge
- DevTools modo móvil

**O usar dispositivos reales:**
- Smartphone (WiFi)
- Tablet (WiFi)
- Laptop en segunda red (hotspot)

---

¿Todo funcionó? ¡Felicidades! 🎉 Estás listo para deployer a GitHub Pages.
