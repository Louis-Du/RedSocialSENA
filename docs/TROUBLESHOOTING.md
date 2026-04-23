# 🛠️ REFERENCIA DE COMANDOS Y TROUBLESHOOTING

## 🚀 COMANDOS DE EJECUCIÓN

### Servidor Local (Solo este computador)
```bash
cd prototipo
python3 -m http.server 8080 --bind 127.0.0.1
```
- Accede: `http://127.0.0.1:8080/index.html`
- Solo tú puedes acceder

### Servidor en Red (Múltiples dispositivos)
```bash
cd prototipo
python3 -m http.server 8080 --bind 0.0.0.0
```
- Acceden otros en tu WiFi
- Versátil para pruebas móviles

### Puerto Personalizado
```bash
python3 -m http.server 3000 --bind 0.0.0.0
python3 -m http.server 5000 --bind 0.0.0.0
```

### Script Integrado
```bash
./guia-rapida.sh
# Selecciona opción 1, 2 o 3
```

---

## 🔍 ENCONTRAR TU IP LOCAL

### Linux/Mac
```bash
# Opción 1
hostname -I

# Opción 2
ifconfig | grep inet

# Opción 3
ip addr show
```

### Windows
```cmd
ipconfig
```

---

## 🔐 VERIFICAR FIREBASE

### En DevTools (F12 → Console)

#### ¿Firebase está inicializado?
```javascript
console.log(firebase)
// Debe mostrar: {apps: Array(1), auth, database, ...]
```

#### ¿El usuario actual está autenticado?
```javascript
console.log(auth.currentUser)
// Logueado: {uid: "abc123", email: "..."}
// No logueado: null
```

#### ¿Puedo leer datos de Firestore?
```javascript
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const q = getDocs(collection(db, 'posts'));
q.then(snap => console.log('Posts:', snap.docs.length));
```

#### Ver proyecto actual
```javascript
console.log(auth.app.options.projectId)
// Debe mostrar: "red-social-sena"
```

---

## 🐛 TROUBLESHOOTING COMÚN

### Error: "Port already in use"
```bash
# Cambiar puerto
python3 -m http.server 3000 --bind 0.0.0.0

# O matar proceso en puerto 8080
lsof -i :8080
kill -9 <PID>
```

### Error: "Firebase configuration missing"
```bash
# Verificar archivo existe
ls -la prototipo/js/firebase-config.js

# Debe contener credenciales reales, no "TU_API_KEY_AQUI"
grep apiKey prototipo/js/firebase-config.js
```

### Error: "Cannot read property 'uid' of null"
Usuario no autenticado
```bash
# Solución:
1. Registrarse o loguearse
2. Verificar credenciales
3. Revisar en Firebase Console que la cuenta existe
```

### No ve cambios en tiempo real
```bash
# 1. Verificar listeners:
console.log(postService.activeListeners.size)

# 2. Verificar conexión
navigator.onLine

# 3. Revisar Network en DevTools
# Buscar: firestore.googleapis.com

# 4. Limpiar cache
# Ctrl+Shift+Delete → Cookies y datos de sitios
```

### Imágenes no se cargan en Chat
```javascript
// Ir a Firebase Console → Storage → Reglas
// Debe ser:
// allow read: if request.auth != null;
// allow write: if request.auth != null;
```

---

## 🧹 LIMPIEZA Y RESET

### Limpiar localStorage
```javascript
// En DevTools Console:
localStorage.clear()
// O desde DevTools:
// Application → Local Storage → Seleccionar dominio → Delete all
```

### Limpiar SessionStorage
```javascript
sessionStorage.clear()
```

### Logout y recargar
```javascript
// En DevTools
auth.signOut().then(() => {
    location.reload()
})
```

### Resetea estado local de la app
```javascript
// En Console
appState.clearAllData()
location.reload()
```

---

## 📊 MONITOREO Y DEBUG

### Ver logs del servidor
```bash
# Con timestamp
python3 -m http.server 8080 2>&1 | tee server.log

# Ver conexiones en tiempo real
watch -n 1 'lsof -i :8080'
```

### Monitorear Firestore desde Console
```bash
# Ir a: https://console.firebase.google.com
# Proyecto → Firestore → Ver datos en tiempo real
```

### Ver requests de red
```bash
# DevTools → Network
# Filtrar por: firestore
# Ver todas las peticiones a la DB
```

---

## 🌐 NGROK - Acceso desde Internet

### Instalar
```bash
# Descargar desde: https://ngrok.com/download
# O vía homebrew/apt:
brew install ngrok
apt install ngrok
```

### Usar
```bash
# Terminal 1: Servidor local
python3 -m http.server 8080

# Terminal 2: Túnel
ngrok http 8080
```

Output:
```
Forwarding    https://abc123.ngrok.io → http://localhost:8080
```

### Compartir
```
https://abc123.ngrok.io/index.html
```

---

## 📱 SIMULAR DISPOSITIVOS EN UN NAVEGADOR

### Chrome/Edge DevTools
```bash
Presiona: F12 → Ctrl+Shift+M (o icono 📱)
```

### Dispositivos disponibles
- iPhone 12, 13, 14, 15
- iPad, iPad Pro
- Pixel 4, 5, 6, 7
- Galaxy S8+, S20, S21

### Simular velocidad
- DevTools → Network → Throttling
- 4G, 3G, Slow 3G

### Simular orientación
- DevTools → Sensors → Orientation

---

## ✅ CHECKLIST ANTES DE DEPLOYER

- [ ] Firebase config verificado
- [ ] Todos los servicios funcionan localmente
- [ ] Chat en tiempo real funciona con múltiples dispositivos
- [ ] Imágenes se cargan correctamente
- [ ] No hay errores en Console
- [ ] Responsive en móvil
- [ ] README.md actualizado
- [ ] Commit y push hecho
- [ ] Deployer a GitHub Pages

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE VERIFICAR

### 1. Optimización
```bash
npm run build:css  # Compilar Tailwind
```

### 2. Deploy a GitHub Pages
```bash
git add .
git commit -m "Firebase verificado y funcionando"
git push origin main
```

### 3. Verificar en línea
```
https://louis-du.github.io/RedSocialSENA/
```

### 4. Configurar dominio personalizado (Opcional)
GitHub → Settings → Pages → Custom domain

---

¿Necesitas ayuda? Mira [GUIA_EJECUCION_FIREBASE.md](./GUIA_EJECUCION_FIREBASE.md) para documentación completa.
