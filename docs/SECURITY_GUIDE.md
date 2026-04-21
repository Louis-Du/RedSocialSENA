# 🔐 Guía de Seguridad - Credenciales Firebase

## El Problema
Este es un **repositorio público en GitHub**. Las credenciales de Firebase NO deben estar en control de versión.

**⚠️ RIESGO**: 
- GitHub escanea repositorios públicos buscando API keys
- Los bots de hackers scrappean repos públicos continuamente
- Una credencial comprometida = tu base de datos está abierta

---

## La Solución: 3 Capas de Protección

### 1️⃣ .gitignore (YA CONFIGURADO ✅)
```gitignore
# Firebase credentials
prototipo/js/firebase-config.js
!prototipo/js/firebase-config.example.js
```

Esto excluye `firebase-config.js` de Git pero permite `firebase-config.example.js`

---

### 2️⃣ Archivo Ejemplo en Git (YA CREADO ✅)
```
prototipo/js/firebase-config.example.js  ← ESTO está en Git (seguro)
prototipo/js/firebase-config.js          ← ESTO NO está en Git (ignorado)
```

**Flujo para nuevos contribuidores:**
```bash
# 1. Clonan el repo
git clone https://github.com/Louis-Du/RedSocialSENA.git
cd RedSocialSENA

# 2. Copian el archivo ejemplo
cp prototipo/js/firebase-config.example.js prototipo/js/firebase-config.js

# 3. Editan con sus propias credenciales
nano prototipo/js/firebase-config.js  # ← SOLO LOCAL, nunca commitea
```

---

### 3️⃣ Verificar que NO existe en Git

```bash
cd /home/luisdue/repos/RedSocialSena

# Ver si accidentalmente fue commitead
git log --all --full-history -- prototipo/js/firebase-config.js

# Ver estado actual
git status prototipo/js/firebase-config.js
# Debe mostrar: (lista blanca porque está en .gitignore) ✅
```

Si salió algo, ejecutar:
```bash
# Remover del histórico (DESTRUCTIVO - solo en emergencia)
git filter-branch --tree-filter 'git rm -f prototipo/js/firebase-config.js' HEAD
git push origin --force
```

---

## 🚀 Instrucciones para Producción

### En tu máquina local (SEGURO ✅)
```bash
# 1. Copiar archivo ejemplo
cp prototipo/js/firebase-config.example.js prototipo/js/firebase-config.js

# 2. Editar con credenciales REALES
nano prototipo/js/firebase-config.js

# Debería quedar:
const firebaseConfig = {
    apiKey: "AIzaSyD...REAL",          # Tu API key real
    authDomain: "tuproy.firebaseapp.com",
    projectId: "mi-proyecto-123",
    // ... más credenciales
};
```

### En servidor de producción (OPCIÓN MEJORADA)
```bash
# Usar variables de entorno en lugar de archivo
# En el servidor, establecer variables:
export FIREBASE_API_KEY="AIzaSyD..."
export FIREBASE_AUTH_DOMAIN="tuproy.firebaseapp.com"
# etc...

# Luego mapear en firebase-config.js:
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ...
};
```

---

## ⚠️ Checklist de Seguridad

- [x] `.gitignore` configurado para excluir `firebase-config.js`
- [x] `firebase-config.example.js` en Git (plantilla segura)
- [x] Instrucciones en README o en el archivo ejemplo
- [ ] **VERIFICA**: `firebase-config.js` NO está en Git actualmente
- [ ] **VERIFICA**: Tu rama no tiene credenciales reales commitadas

### Verificar estado:
```bash
git status | grep firebase-config  # No debe salir nada (ignorado ✅)
git log --oneline -- prototipo/js/firebase-config.js  # No debe salir nada
```

---

## Si Accidentalmente Commitaste Credenciales

**ACCIÓN INMEDIATA** (en orden):

1. **Rotar credenciales en Firebase Console** ← LO MÁS IMPORTANTE
   - https://console.firebase.google.com
   - Crear nueva API key y usar esa

2. **Remover de Git**
   ```bash
   git filter-branch --tree-filter 'git rm -f prototipo/js/firebase-config.js' HEAD
   git push origin --force
   ```

3. **Avisar en Issues** que se han rotado las credenciales

4. **Todos los que clonaron el repo deben hacer:**
   ```bash
   git pull  # Ver los cambios
   git filter-branch --tree-filter 'git rm -f prototipo/js/firebase-config.js' HEAD
   ```

---

## Alternativa: Firebase Local Emulator Suite

Para desarrollo local sin riesgos:
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar emulador
firebase emulators:start

# Las credenciales quedan en localhost, 100% seguro
const firebaseConfig = {
    apiKey: "fake-key-for-local-testing",
    authDomain: "localhost:5000",
    projectId: "demo-project",
    // emulator addresses...
};
```

---

## 📚 Referencias

- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/chapters/best-practices)
- [GitHub Secret Scanning](https://github.blog/2021-04-05-behind-github-secret-scanning/)
- [Node.js dotenv para variables de entorno](https://www.npmjs.com/package/dotenv)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

---

**Estado:** ✅ Proyecto configurado de forma segura
**Última revisión:** 13 de febrero de 2026
