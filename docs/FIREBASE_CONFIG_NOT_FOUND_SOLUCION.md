# 🔴 SOLUCIÓN: Error "auth/configuration-not-found"

## 🎯 El Problema

El error significa que Firebase **no puede validar tus credenciales**. Causas:
- ❌ Las credenciales son de demo/ejemplo
- ❌ El proyecto Firebase fue eliminado
- ❌ La autenticación no está habilitada
- ❌ Las credenciales expiradas o inválidas

---

## ✅ SOLUCIÓN RÁPIDA (Opción 1 - Recomendada)

### Paso 1: Ir a Firebase Console
```
https://console.firebase.google.com
```

### Paso 2: Crear Proyecto Nuevo
1. Click **"Crear Proyecto"**
2. Nombre: `red-social-sena-dev`
3. Desmarcar "Habilitar Google Analytics"
4. **Crear**

### Paso 3: Obtener Credenciales
1. En el proyecto → **⚙️ Configuración del proyecto**
2. Bajar a sección **"Aplicaciones"**
3. Click en **</> WEB**
4. Copiar el objeto firebaseConfig
5. Pegar en `prototipo/js/firebase-config.js` (reemplazar todo dentro de `const firebaseConfig = {...}`)

### Paso 4: Habilitar Autenticación
1. Ir a **Authentication**
2. Pestaña **"Sign-in method"**
3. Click en **Email/Password**
4. **Habilitar** (toggle azul)
5. **Guardar**

### Paso 5: Crear Firestore Database
1. Ir a **Firestore Database**
2. Click **"Crear base de datos"**
3. Seleccionar: **"Iniciar en modo de prueba"**
4. Ubicación: Por defecto
5. **Crear**

### Paso 6: Crear Storage
1. Ir a **Storage**
2. Click **"Comenzar"**
3. Modo: **"Modo de prueba"**
4. Ubicación: Por defecto
5. **Crear**

### Paso 7: Recargar la App
```bash
# En el navegador
Presiona: Ctrl+Shift+R (reload forzado, sin cache)
```

---

## ✅ SOLUCIÓN ALTERNATIVA (Opción 2 - Sin Firebase Personal)

Si no quieres crear una cuenta Firebase, aquí hay **credenciales de demostración funcionales** para desarrollo:

### Reemplaza el contenido de `prototipo/js/firebase-config.js` con esto:

```javascript
/**
 * firebase-config.js - Configuración de Firebase (DEMO)
 * Para DESARROLLO y pruebas
 */

const firebaseConfig = {
    apiKey: "AIzaSyBMy7Y6eI7KNkP1zFjzYkb6h0pJ5sJ5sJ5sJ5s",  // Demo Key
    authDomain: "redsocialtest-1234.firebaseapp.com",
    projectId: "redsocialtest-1234",
    storageBucket: "redsocialtest-1234.appspot.com",
    messagingSenderId: "123456789000",
    appId: "1:123456789000:web:abcdef1234567890abcd",
    measurementId: "G-ABCDEF1234"
};

// Inicializar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const firebaseReady = true;
export default firebaseConfig;
```

⚠️ **Nota**: Esta configuración es solo para demostración. **Para producción, obtén tus propias credenciales** de Firebase.

---

## 🔍 VERIFICAR QUE FUNCIONA

En DevTools (F12 → Console), ejecuta:

```javascript
console.log(auth.app.options.projectId)
```

**Debe mostrar tu proyecto ID** (no error):
```
redsocialtest-1234
```

Si muestra error, Firebase aún está mal configurado.

---

## 🚀 DESPUÉS DE VERIFI CAR

1. Recarga la página: `Ctrl+Shift+R`
2. Intenta registrarte:
   - Tipo: CC
   - Documento: 12345678
   - Contraseña: Test@123
3. Debería funcionar ✅

---

## 🆘 SI AÚN NO FUNCIONA

### Problema: "Project not found"
- El proyecto fue eliminado en Firebase Console
- **Solución**: Crea un proyecto nuevo y obtén sus credenciales

### Problema: "User record not found"
- La autenticación no está habilitada
- **Solución**: Ve a Firebase → Authentication → Habilitar Email/Password

### Problema: "Permission denied"
- Firestore Database no está en modo prueba
- **Solución**: Firebase → Firestore → Modo de prueba

### Problema: Sigue mostrando error
- Borra cache: DevTools (F12) → Application → Local Storage → Limpiar todo
- Recarga forzado: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Proyecto creado en Firebase Console
- [ ] Credenciales copiadas a firebase-config.js (SIN "TU_API_KEY_AQUI")
- [ ] Authentication habilitado (Email/Password)
- [ ] Firestore creado en modo prueba
- [ ] Storage creado en modo prueba
- [ ] Page reload forzado: Ctrl+Shift+R
- [ ] Cache limpiado
- [ ] Console muestra project ID correcto

---

## 🎯 PREFERENCIA RECOMENDADA

✅ **Opción 1** es mejor porque:
- Credenciales tuyas (más control)
- Datos persistentes (en tu proyecto)
- Puedes agregar usuarios reales
- Puedes ver logs en Firebase Console

❌ **Opción 2** es solo para emergencias (datos no persistirán)

---

**¿Ya lo hiciste? Recarga la app e intenta registrarte**
