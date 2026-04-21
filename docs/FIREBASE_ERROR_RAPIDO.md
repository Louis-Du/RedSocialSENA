# 🔴 ERROR: auth/configuration-not-found

## ❌ ¿Qué pasó?
Firebase no reconoce tus credenciales. Causas:
- El proyecto Firebase está eliminado ❌
- Las credenciales son inválidas ❌  
- Authentication no está habilitado ❌

## ✅ SOLUCIÓN EN 5 MINUTOS

### Paso 1: Crea Proyecto Firebase NUEVO (2 min)
```
1. Abre: https://console.firebase.google.com
2. Click: "Crear Proyecto"
3. Nombre: red-social-sena-dev
4. Desmarcar: Google Analytics
5. CREAR
```

### Paso 2: Habilita Autenticación (1 min)
```
1. En tu proyecto → Authentication
2. Pestaña: Sign-in method
3. Click: Email/Password
4. Toggle: AZUL (habilitar)
5. GUARDAR
```

### Paso 3: Habilita Firestore (1 min)
```
1. En tu proyecto → Firestore Database
2. CREAR base de datos
3. Modo: "Iniciar en modo de prueba"
4. Ubicación: Por defecto
5. CREAR
```

### Paso 4: Habilita Storage (1 min)
```
1. En tu proyecto → Storage
2. COMENZAR
3. Modo: "Modo de prueba"
4. Ubicación: Por defecto
5. CREAR
```

### Paso 5: COPIA TUS CREDENCIALES (2 min)
```
1. En tu proyecto → ⚙️ Configuración
2. Bajar a: "Aplicaciones"
3. Click: </> WEB
4. COPIAR el objeto firebaseConfig
5. Pegar en: prototipo/js/firebase-config.js
   - Reemplaza TODOS los valores entre llaves {}
   - NO incluyas const firebaseConfig = { ... };
   - Solo los VALORES interiores
```

### Paso 6: RECARGA LA APP
```
En navegador:
- Presiona: Ctrl+Shift+R  (Windows)
- O: Cmd+Shift+R        (Mac)

Esto limpia cache y recarga
```

### Paso 7: INTENTA REGISTRARTE
```
Tipo: CC
Documento: 12345678
Contraseña: Test@123

Click: Registrarse
```

---

## 🎬 EJEMPLO VISUAL

### En Firebase Console

Después de crear proyecto, verás:

```
⚙️ Configuración del Proyecto
↓
Aplicaciones
↓
</> WEB (click aquí)
↓
COPIAR esto:
┌─────────────────────────────┐
│ const firebaseConfig = {     │
│   apiKey: "ABC123...",       │
│   authDomain: "...",         │
│   projectId: "...",          │
│   ...                        │
│ };                           │
└─────────────────────────────┘
```

### En firebase-config.js

```javascript
const firebaseConfig = {
    apiKey: "PEGA_AQUÍ_TU_API_KEY",
    authDomain: "PEGA_AQUÍ_TU_AUTH_DOMAIN",
    projectId: "PEGA_AQUÍ_TU_PROJECT_ID",
    storageBucket: "PEGA_AQUÍ",
    messagingSenderId: "PEGA_AQUÍ",
    appId: "PEGA_AQUÍ",
    measurementId: "PEGA_AQUÍ"
};
```

---

## ✅ VERIFICAR QUE FUNCIONA

### En DevTools (F12)

```javascript
// Escribe en Console:
auth.app.options.projectId
```

**Debe mostrar tu proyecto ID**, ej:
```
red-social-sena-dev
```

Si muestra ERROR → Firebase aún está mal configurado

---

## 🆘 SI NO FUNCIONA AÚN

### Problema: "User record not found"
```
✓ Verificar: Fuiste a Authentication
✓ Habilitar: Email/Password
✓ GUARDAR
```

### Problema: "permission-denied"
```
✓ Verificar: Firestore está en MODO PRUEBA
✓ Verificar: Storage está en MODO PRUEBA
```

### Problema: "project-deleted"
```
✓ Tu proyecto Firebase fue eliminado
✓ Crea uno NUEVO
✓ Obtén credenciales del NUEVO
```

### Problema: Sigue sin funcionar
```
✓ Ctrl+Shift+R (recarga sin cache)
✓ F12 → Application → Local Storage → Limpiar TODO
✓ Recarga nuevamente
✓ Intenta registrarte
```

---

## 📋 CHECKLIST

- [ ] Proyecto creado en Firebase
- [ ] Credenciales copiadas a firebase-config.js
- [ ] Authentication habilitado
- [ ] Firestore en MODO PRUEBA
- [ ] Storage en MODO PRUEBA
- [ ] Recarga: Ctrl+Shift+R
- [ ] Console limpio de errores (F12)
- [ ] DevTools muestra tu projectId

---

## 📞 ¿DÓNDE OBTENER CREDENCIALES?

**URL**: `https://console.firebase.google.com`

Steps:
1. Login con tu Google
2. Seleccionar o crear proyecto
3. ⚙️ CONFIGURACIÓN
4. Sección "APLICACIONES"
5. </> WEB
6. Copiar bloque `firebaseConfig`

---

## 🎯 LISTO CUANDO

- ✅ Firebase Console muestra tu proyecto activo
- ✅ Authentication Online (Email/Password)
- ✅ Firestore activo
- ✅ Storage activo
- ✅ Credenciales en firebase-config.js (SIN "TU_API_KEY")
- ✅ App recargada (Ctrl+Shift+R)
- ✅ Puedes registrarte

---

**Ahora intenta registrarte. ¿Funciona? 🎉 ¡Éxito!**
