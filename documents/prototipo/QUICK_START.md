# 🚀 Quick Start - Guía Rápida de Inicio

## ⚡ 5 Minutos para Comenzar

### 1️⃣ Abrir la App

```
1. Navega a: prototipo/index.html
2. Abre en navegador
3. Deberías ver la pantalla de login
```

### 2️⃣ Hacer Login

```
Tipo de Documento: CC
Número: 1234567890
Contraseña: sena123

Click: "Ingresar"
```

### 3️⃣ Crear un Post

```
1. Botón "+" en header (o en feed)
2. Escribe: "Mi primer post!"
3. Click: "Publicar"
4. ¡Ves tu post en el feed!
```

### 4️⃣ Comentar

```
1. En tu post, escribe: "Qué genial"
2. Click: Enviar (ícono de paper plane)
3. ¡Ves tu comentario!
```

### 5️⃣ Chat

```
1. Botón "Chats" en nav
2. Selecciona un usuario
3. Escribe: "Hola!"
4. Click: Enviar
5. ¡Conversación creada!
```

---

## 🐛 Debugging

### Ver Estado en Consola (F12)

```javascript
// Estado completo
window.__APP__.appState.getDebugState()

// Ver posts
window.__APP__.appState.posts

// Ver usuario
window.__APP__.userService.getCurrentUser()

// Recargar feed
window.reloadFeed()
```

---

## 📚 Documentación Disponible

```
├── README_REFACTORIZACION.md
│   └─ Overview, features, setup
│
├── ARQUITECTURA.md
│   └─ Explicación técnica detallada
│
├── MIGRACION_BACKEND.md
│   └─ Cómo conectar backend real
│
├── EJEMPLOS_Y_PRUEBAS.md
│   └─ Casos de uso y pruebas
│
├── RESUMEN_REFACTORIZACION.md
│   └─ Transformación antes/después
│
└── ESTRUCTURA_ARCHIVOS.md
    └─ Descripción de cada archivo
```

---

## ❓ Problemas Comunes

### "No aparece nada"
```javascript
// Abre consola (F12)
console.log('¿Hay errores?')
window.__APP__.appState.getDebugState()
```

### "No puedo crear post"
```javascript
// Verifica que estés logueado
window.__APP__.userService.isLoggedIn()

// Limpia localStorage si hay problema
localStorage.clear()
location.reload()
```

### "El chat no funciona"
```javascript
// Verifica primeros mensajes
const state = window.__APP__.chatService.getChatState('user_2');
console.log(state) // debe mostrar isFirstMessage

// Primer mensaje SOLO PUEDE SER TEXTO
// Mensajes posteriores pueden tener imágenes
```

---

## 💡 Trucos Útiles

### Crear datos de prueba rápido

```javascript
// 5 posts de prueba
for (let i = 1; i <= 5; i++) {
  await window.__APP__.postService.createPost(`Post ${i}`)
}

// Comentarios en posts
const posts = window.__APP__.appState.posts;
posts.forEach(p => 
  window.__APP__.commentService.addComment(p.id, 'Genial!')
)

// Ver todo
window.reloadFeed()
```

### Exportar estado completo

```javascript
// Guardar estado como JSON
const state = window.__APP__.appState.getDebugState();
console.log(JSON.stringify(state, null, 2))

// Copiar y guardar en archivo para análisis
```

### Limpiar y empezar de nuevo

```javascript
localStorage.clear()
location.reload()
// Volverá a mostrar login vacío
```

---

## 🎯 Próximas Acciones

### Si quieres entender la arquitectura:
```
1. Lee: README_REFACTORIZACION.md (5 min)
2. Lee: ARQUITECTURA.md (15 min)
3. Explora: js/main.js (ver imports)
4. Entiende: js/services/PostService.js (30 min)
```

### Si quieres conectar backend:
```
1. Lee: MIGRACION_BACKEND.md (15 min)
2. Crea endpoints: /api/posts, /api/auth, etc.
3. Actualiza servicios (copy-paste cambios)
4. Test (ningún cambio en UI)
```

### Si quieres probar features:
```
1. Lee: EJEMPLOS_Y_PRUEBAS.md
2. Ejecuta casos de prueba
3. Verifica checklist
4. Debug con consola
```

---

## 📞 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| No aparece login | Abre DevTools (F12), verifica errores |
| Login no funciona | Documenta tiene que ser CC, cualquier número |
| Posts no persisten | Verifica localStorage no está lleno |
| Chat no funciona | Primer mensaje SOLO TEXTO |
| Imágenes muy grandes | Máximo 5MB |
| Quiero escalar | Ver MIGRACION_BACKEND.md |

---

## ✅ Checklist Básico

- [ ] Abriste prototipo/index.html
- [ ] Hiciste login
- [ ] Creaste un post
- [ ] Comentaste
- [ ] Abriste consola y viste state
- [ ] Leíste al menos 1 archivo .md
- [ ] Recargaste página y datos persisten
- [ ] Probaste el chat

---

## 🎓 Próximo Nivel

**Entender el flujo completo:**

```
usuario.click("crear post")
    ↓
PostManager.handleCreatePost()
    ↓
PostService.createPost()
    ↓
AppState.createPost()
    ↓
localStorage.setItem()
    ↓
AppState.notifySubscribers('posts')
    ↓
FeedRenderer.renderFeed()
    ↓
DOM update
    ↓
usuario ve post
```

**Todo sin tocar HTML manualmente** ✅

---

## 🚀 Backend Ready

Cuando tengas backend listo:

```javascript
// En PostService.js, cambias de:
const post = appState.createPost(...);

// A:
const response = await fetch('/api/posts', {...});
const post = await response.json();

// ¡ESO ES! La UI sigue funcionando igual
```

---

## 📞 Preguntas?

```
¿Cómo funciona?        → ARQUITECTURA.md
¿Cómo migro a backend? → MIGRACION_BACKEND.md
¿Cómo pruebo?          → EJEMPLOS_Y_PRUEBAS.md
¿Qué archivos hay?     → ESTRUCTURA_ARCHIVOS.md
¿Qué cambió?           → RESUMEN_REFACTORIZACION.md
```

---

**¡Listo para empezar!** 🎉

1. Abre index.html
2. Login: CC / cualquier número / sena123
3. ¡Diviértete!

Cualquier pregunta, consulta los .md files.
