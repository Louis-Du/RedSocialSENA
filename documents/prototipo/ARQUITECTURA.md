# Arquitectura del Frontend - Red Social SENA

## 📐 Visión General

Este frontend está arquitectado en **capas desacopladas** para ser:
- ✅ Un prototipo demostrativo funcional
- ✅ Un frontend final listo para conectar a backend real
- ✅ Mantenible y escalable
- ✅ Fácil de testear

## 🏗️ Estructura de Capas

### 1. **AppState** (`js/AppState.js`)
**Responsabilidad:** Gestión centralizada del estado global

```
AppState
├── currentUser (usuario actual)
├── users (otros usuarios)
├── posts (todas las publicaciones)
├── comments (comentarios por post)
├── chats (conversaciones)
└── subscribers (sistema de suscriptores)
```

**Características:**
- Datos se persisten en localStorage
- Sistema de suscriptores para cambios
- Independiente de la UI
- Métodos para CRUD de posts, comentarios, etc.

**Transición a Backend:**
```javascript
// Antes (Mock en localStorage)
this.posts = getFromStorage('appState', []);

// Después (Backend real)
this.posts = await fetch('/api/posts').then(r => r.json());
```

---

### 2. **Servicios** (`js/services/`)

Los servicios **actúan como intermediarios** entre la UI y el estado. Implementan:
- Validaciones de negocio
- Autorizaciones (usuario actual solo puede editar/eliminar sus posts)
- Lógica de reglas

#### **UserService.js**
```javascript
import { userService } from './services/UserService.js';

// Login
const result = await userService.login(tipoDoc, documento, password);

// Obtener usuario
const user = userService.getCurrentUser();

// Verificar permisos
if (userService.canDeletePost(post)) { ... }
```

#### **PostService.js**
```javascript
// Crear post
const result = await postService.createPost(content, imageFile);

// Obtener feed
const posts = await postService.getFeed(options);

// Eliminar post
const result = await postService.deletePost(postId);
```

#### **CommentService.js**
```javascript
// Añadir comentario
const result = await commentService.addComment(postId, content);

// Obtener comentarios
const comments = commentService.getComments(postId);

// Eliminar
const result = await commentService.deleteComment(postId, commentId);
```

#### **ChatService.js**
```javascript
// Enviar mensaje (valida: primer mensaje solo texto)
const result = await chatService.sendMessage(userId, content, imageFile);

// Obtener conversación
const messages = chatService.getMessages(userId);

// Verificar si puede enviar imagen
if (chatService.canSendImageMessage(userId)) { ... }
```

**Ventaja:** Si se conecta un backend, solo cambias los servicios:

```javascript
// PostService.js (cambio mínimo)
async createPost(content, imageFile) {
    // Antes:
    // const post = appState.createPost(content, imageUrl);
    
    // Después (Backend):
    const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content, imageUrl })
    });
    const post = await response.json();
    appState.posts.push(post); // Cachear en cliente
    return post;
}
```

---

### 3. **Gestores de UI** (`js/ui/`)

Controladores que manejan interacciones del usuario y actualizaciones visuales.

#### **AuthManager.js**
```javascript
// Login/Logout desde formularios
// Verifica sesiones existentes
// Cambia entre vistas login/app
```

#### **NavigationManager.js**
```javascript
// Navega entre vistas principales
// Sincroniza estado visual
navigationManager.showView('app');
navigationManager.showView('editProfile');
```

#### **PostManager.js**
```javascript
// Maneja creación de posts (modal y inline)
// Valida y llama a PostService
// Actualiza UI con resultados
```

#### **ModalManager.js**
```javascript
// Abre/cierra modales
// Confirmaciones de eliminación
// Muestra alertas y notificaciones
```

#### **FeedRenderer.js**
```javascript
// Genera HTML seguro de posts/comentarios
// Event delegation para botones
// Renderiza y actualiza feed
```

#### **ChatManager.js**
```javascript
// Maneja envío de mensajes
// Navega entre conversaciones
// Aplica reglas (primer mensaje solo texto)
```

#### **TabManager.js**
```javascript
// Alterna entre tabs de perfil
// Sincroniza desktop y mobile
```

---

### 4. **Utilidades** (`js/utils.js`)

Funciones compartidas:
- `escapeHTML()` - Prevenir XSS
- `isValidText()` - Validaciones
- `formatTime()`, `getRelativeTime()` - Formateo de fechas
- `generateId()` - IDs únicos
- `getFromStorage()`, `saveToStorage()` - LocalStorage seguro
- `readFileAsDataURL()` - Lectura de archivos
- `isValidImageFile()` - Validación de imágenes

---

### 5. **main.js** - Inicializador

Punto de entrada que:
1. Carga AppState y servicios
2. Configura suscriptores a cambios
3. Inicializa gestores de UI
4. Carga datos iniciales
5. Habilita modo debug en desarrollo

```javascript
// En la consola (development)
window.__APP__.appState.getDebugState()
window.reloadFeed()
```

---

## 🔄 Flujo de Datos

### Ejemplo: Crear una Publicación

```
Usuario escribe y hace click en "Publicar"
    ↓
PostManager captura el evento
    ↓
Valida que sea un módulo: PostManager → PostService
    ↓
PostService valida reglas de negocio
    ↓
PostService llama a AppState.createPost()
    ↓
AppState guarda en localStorage
    ↓
AppState notifica a suscriptores
    ↓
FeedRenderer escucha cambio y re-renderiza feed
    ↓
UI actualiza automáticamente
```

**Importante:** La UI **nunca** accede directamente a localStorage. Todo pasa por servicios.

---

## 🔐 Reglas de Negocio Implementadas

### ✅ Autenticación y Autorización
- Solo el propietario puede editar/eliminar su post
- Solo el autor del comentario puede eliminarlo

### ✅ Validaciones
- Campos no vacíos
- Imagen máximo 5MB
- Documento válido (CC, TI, CE)
- Contraseña mínimo 6 caracteres

### ✅ Chat
- **Primer mensaje solo texto** (sin imágenes)
- Mensajes posteriores pueden tener imágenes

### ✅ Persistencia
- Los datos persisten con localStorage
- Se recuperan al recargar la página

---

## 🚀 Transición a Backend

### Paso 1: Implementar API endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/posts
POST   /api/posts
DELETE /api/posts/:id
GET    /api/posts/:id/comments
POST   /api/posts/:id/comments
DELETE /api/posts/:id/comments/:commentId
POST   /api/chats/send
GET    /api/chats/:userId/messages
```

### Paso 2: Actualizar servicios

```javascript
// Antes (mock)
class PostService {
    async createPost(content, imageFile) {
        const post = appState.createPost(content, imageUrl);
        return post;
    }
}

// Después (backend)
class PostService {
    async createPost(content, imageFile) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('image', imageFile);
        
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });
        const post = await response.json();
        
        // Actualizar cache local
        appState.posts.unshift(post);
        appState.notifySubscribers('posts');
        
        return post;
    }
}
```

### Paso 3: Usar tokens JWT

```javascript
// UserService
async login(tipoDoc, documento, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ tipoDoc, documento, password })
    });
    const { token, user } = await response.json();
    
    localStorage.setItem('token', token);
    appState.currentUser = user;
    appState.currentUser.isLoggedIn = true;
    
    return { success: true, user };
}
```

### Paso 4: Añadir autenticación a requests

```javascript
// utils.js - Fetch mejorado
export async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        // Token expirado, redirigir a login
        appState.logoutUser();
        navigationManager.showView('login');
    }
    
    return response;
}
```

---

## 📁 Estructura de Archivos Final

```
prototipo/
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── lucide.min.js
│   ├── logo-sena-blanco.png
│   ├── logo-sena-verde.png
│   └── firma-digital-sena.png
├── js/
│   ├── main.js              # Inicializador
│   ├── AppState.js          # Estado global
│   ├── utils.js             # Utilidades
│   ├── services/
│   │   ├── UserService.js
│   │   ├── PostService.js
│   │   ├── CommentService.js
│   │   └── ChatService.js
│   └── ui/
│       ├── NavigationManager.js
│       ├── AuthManager.js
│       ├── PostManager.js
│       ├── ModalManager.js
│       ├── FeedRenderer.js
│       ├── ChatManager.js
│       └── TabManager.js
└── README.md
```

---

## 🧪 Testing y Debug

### En la consola del navegador:

```javascript
// Ver estado completo
window.__APP__.appState.getDebugState()

// Ver posts
window.__APP__.appState.posts

// Ver usuario actual
window.__APP__.userService.getCurrentUser()

// Recargar feed
window.reloadFeed()

// Login simulado
await window.__APP__.userService.login('CC', '1234567890', 'password123')

// Crear post
await window.__APP__.postService.createPost('Hola mundo')

// Ver servicios
window.__APP__
```

---

## 💡 Principios Seguidos

1. **Separación de responsabilidades** - Cada módulo hace una cosa bien
2. **Inversión de dependencias** - Los servicios dependen de AppState, no al revés
3. **DRY** - No repetir código, usar utils compartidas
4. **Seguridad** - Siempre escapar HTML, validar inputs
5. **Performance** - Usar event delegation, minimizar re-renders
6. **Mantenibilidad** - Código comentado, nombres claros, estructura clara
7. **Escalabilidad** - Fácil agregar nuevas funcionalidades sin romper existentes
8. **Preparado para backend** - Cambio mínimo cuando se conecte API real

---

## 📝 Notas para el Futuro

- [ ] Añadir sistema de notificaciones visual (toasts)
- [ ] Implementar filtros de feed (por trimestre, programa, tags)
- [ ] Búsqueda de posts
- [ ] Edición de posts
- [ ] Likes/reacciones a posts
- [ ] Seguir/dejar de seguir usuarios
- [ ] Mensajes de grupo/comunidades
- [ ] Upload de imágenes a CDN (en lugar de data URLs)
- [ ] Sincronización en tiempo real (WebSockets)
- [ ] Offline-first (Service Workers)

---

**Estado:** ✅ Listo para prototipo y para conectar backend  
**Última actualización:** 9 de febrero de 2026
