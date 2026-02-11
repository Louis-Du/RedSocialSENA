# Guía de Migración: Backend y Mejoras

## 🎯 Objetivo
Convertir el frontend de **mock (localStorage)** a **backend real** sin que cambie ni una línea en la UI.

## 📋 Checklist de Migración

### Fase 1: Preparar Backend API
- [ ] Definir esquema de base de datos
- [ ] Crear endpoints REST `/api/*`
- [ ] Implementar autenticación JWT
- [ ] Validar datos en backend
- [ ] Manejar errores HTTP

### Fase 2: Actualizar Servicios
Los servicios están diseñados para este cambio. Solo modifica la función interna:

```javascript
// UserService.js
async login(tipoDoc, documento, password) {
    // CAMBIO: fetch en lugar de localStorage
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoDoc, documento, password })
    });
    
    if (!response.ok) throw new Error('Error de autenticación');
    
    const { token, user } = await response.json();
    localStorage.setItem('token', token);
    appState.currentUser = user;
    appState.currentUser.isLoggedIn = true;
    
    return { success: true, user };
}
```

### Fase 3: Agregar Interceptor de Autenticación

Crear `js/apiClient.js`:

```javascript
/**
 * Cliente HTTP con autenticación automática
 */
export async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Manejo de token expirado
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    
    // Manejo de errores
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response;
}
```

Luego usarlo en servicios:

```javascript
// PostService.js
import { authenticatedFetch } from '../apiClient.js';

async createPost(content, imageFile) {
    const formData = new FormData();
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);
    
    const response = await authenticatedFetch('/api/posts', {
        method: 'POST',
        body: formData
    });
    
    const post = await response.json();
    appState.posts.unshift(post);
    appState.notifySubscribers('posts');
    return post;
}
```

### Fase 4: Endpoints Requeridos

```
# Autenticación
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register

# Usuarios
GET    /api/users/me                 # Usuario actual
GET    /api/users/:id                # Perfil de otro
PUT    /api/users/me                 # Editar perfil
GET    /api/users/:id/posts          # Posts del usuario

# Publicaciones
GET    /api/posts                    # Feed (con paginación)
GET    /api/posts/:id                # Post específico
POST   /api/posts                    # Crear post
PUT    /api/posts/:id                # Editar post
DELETE /api/posts/:id                # Eliminar post

# Comentarios
GET    /api/posts/:postId/comments
POST   /api/posts/:postId/comments
DELETE /api/posts/:postId/comments/:commentId

# Chat
GET    /api/chats                     # Lista de conversaciones
GET    /api/chats/:userId/messages    # Mensajes con usuario
POST   /api/chats/:userId/messages    # Enviar mensaje
```

### Fase 5: Esquema de Datos

```javascript
// Usuario
{
    id: string,
    tipoDoc: string,
    documento: string,
    nombre: string,
    apodo: string,
    trimestre: string,
    programa: string,
    profilePicture: string|null,
    bio: string,
    createdAt: ISO8601,
    updatedAt: ISO8601
}

// Post
{
    id: string,
    userId: string,
    content: string,
    imageUrl: string|null,
    createdAt: ISO8601,
    updatedAt: ISO8601,
    likes: number,
    likesBy: string[]
}

// Comentario
{
    id: string,
    postId: string,
    userId: string,
    content: string,
    imageUrl: string|null,
    createdAt: ISO8601,
    likes: number
}

// Mensaje
{
    id: string,
    fromUserId: string,
    toUserId: string,
    content: string,
    imageUrl: string|null,
    createdAt: ISO8601,
    read: boolean
}
```

### Fase 6: Manejo de Errores

Estandarizar respuestas de error:

```javascript
// Backend responde
{
    success: false,
    error: "Publicación no encontrada",
    code: "POST_NOT_FOUND"
}

// Frontend maneja
const result = await postService.deletePost(postId);
if (!result.success) {
    modalManager.showError(result.error);
}
```

## 🔄 Cambios por Servicio

### UserService

```javascript
// ANTES
async login(tipoDoc, documento, password) {
    const success = appState.loginUser(tipoDoc, documento, password);
    return { success, user: appState.getCurrentUser() };
}

// DESPUÉS
async login(tipoDoc, documento, password) {
    const response = await authenticatedFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ tipoDoc, documento, password })
    });
    const { token, user } = await response.json();
    localStorage.setItem('token', token);
    appState.currentUser = { ...user, isLoggedIn: true };
    return { success: true, user };
}
```

### PostService

```javascript
// ANTES
async getPosts() {
    return appState.getPosts();
}

// DESPUÉS
async getPosts(page = 1, limit = 10) {
    const response = await authenticatedFetch(
        `/api/posts?page=${page}&limit=${limit}`
    );
    const { posts, total } = await response.json();
    
    // Sincronizar con caché local
    appState.posts = posts;
    appState.notifySubscribers('posts');
    
    return posts;
}
```

### CommentService

```javascript
// ANTES
async addComment(postId, content, imageUrl) {
    return appState.addComment(postId, content, imageUrl);
}

// DESPUÉS
async addComment(postId, content, imageFile) {
    const formData = new FormData();
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);
    
    const response = await authenticatedFetch(
        `/api/posts/${postId}/comments`,
        { method: 'POST', body: formData }
    );
    const comment = await response.json();
    
    if (!appState.comments[postId]) appState.comments[postId] = [];
    appState.comments[postId].unshift(comment);
    appState.notifySubscribers('comments');
    
    return comment;
}
```

## 🧪 Testing

### Pruebas de Integración

```javascript
// test/services.test.js
describe('PostService', () => {
    it('debería crear un post', async () => {
        const result = await postService.createPost('Test');
        expect(result.success).toBe(true);
        expect(result.post.id).toBeDefined();
    });
    
    it('debería rechazar post vacío', async () => {
        const result = await postService.createPost('');
        expect(result.success).toBe(false);
        expect(result.error).toContain('vacío');
    });
});
```

## 🚀 Deployment

### Development
```bash
npm install
npm run dev
# Con mock (localStorage)
```

### Production
```bash
npm run build
npm start
# Con backend real
```

### Environment Variables
```
REACT_APP_API_URL=https://api.sena.local
REACT_APP_DEBUG=false
```

## 📊 Métricas a Considerar

- Tiempo de carga del feed
- Número de requests al backend
- Tamaño de imágenes
- Caché de cliente (Service Workers)
- Sincronización offline

## 🔐 Seguridad

- [ ] Validar inputs en backend
- [ ] Sanitizar HTML
- [ ] CORS configurado correctamente
- [ ] JWT con expiración
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Protección CSRF

## 📝 Notas Importantes

1. **AppState seguirá siendo el caché** - Los datos del backend se cachean en AppState
2. **Listeners se mantienen igual** - La UI seguirá escuchando cambios en AppState
3. **UI no cambia** - Absolutamente nada en la UI necesita actualizarse
4. **Errores consistentes** - Los servicios deben retornar siempre `{ success, error }`

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si el backend está caído?**
R: Puedes mantener modo offline con Service Workers o fallback a mock

**P: ¿Cómo manejar actualizar caché?**
R: Después de cada operación, actualiza AppState y notifica

**P: ¿Necesito cambiar la UI?**
R: No. Los servicios encapsulan todo el cambio

**P: ¿Y si el backend retorna un esquema diferente?**
R: Los servicios hacen mapping de respuesta → formato esperado

---

**Creado:** 9 de febrero de 2026  
**Versión:** 1.0 - Backend Ready
