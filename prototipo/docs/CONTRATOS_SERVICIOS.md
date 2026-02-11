# Contratos de Servicios - Red Social SENA

## Objetivo
Documentar las interfaces estables de todos los servicios para facilitar
la transición a un backend real (Firebase, API REST, etc.) sin modificar la UI.

---

## UserService

### Responsabilidades
- Autenticación (login/logout)
- Gestión de perfil de usuario
- Permisos y autorizaciones
- Consulta de información de usuarios

### Métodos Públicos

#### `login(tipoDoc, documento, password)`
**Propósito**: Autentica un usuario

**Parámetros**:
- `tipoDoc` (string): Tipo de documento ('CC', 'TI', 'CE')
- `documento` (string): Número de documento
- `password` (string): Contraseña

**Retorna**: `Promise<Object>`
```javascript
{
  success: boolean,
  user: Object | null,
  message: string,
  error: string | null
}
```

**Migración a Backend**:
```javascript
// Actual (localStorage)
const mockUser = validateCredentials(tipoDoc, documento, password);

// Futuro (API)
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tipoDoc, documento, password })
});
const result = await response.json();
```

---

#### `logout()`
**Propósito**: Cierra la sesión del usuario actual

**Retorna**: `Promise<Object>`
```javascript
{
  success: boolean,
  error: string | null
}
```

**Migración a Backend**:
```javascript
// Actual
appState.logoutUser();

// Futuro
await fetch('/api/auth/logout', { method: 'POST' });
```

---

#### `getCurrentUser()`
**Propósito**: Obtiene el usuario actualmente autenticado

**Retorna**: `Object | null`
```javascript
{
  id: string,
  tipoDoc: string,
  documento: string,
  nombre: string,
  apodo: string,
  trimestre: string,
  programa: string,
  profilePicture: string,
  bio: string,
  email: string,
  isLoggedIn: boolean
}
```

---

#### `isLoggedIn()`
**Propósito**: Verifica si hay una sesión activa

**Retorna**: `boolean`

---

#### `updateProfile(updates)`
**Propósito**: Actualiza el perfil del usuario actual

**Parámetros**:
- `updates` (Object): Campos a actualizar
  - `nombre` (string, opcional)
  - `apodo` (string, opcional)
  - `bio` (string, opcional)
  - `profilePicture` (string, opcional)
  - `trimestre` (string, opcional)
  - `programa` (string, opcional)

**Retorna**: `Promise<Object>`
```javascript
{
  success: boolean,
  user: Object | null,
  error: string | null
}
```

**Migración a Backend**:
```javascript
// Futuro
await fetch('/api/users/profile', {
  method: 'PUT',
  body: JSON.stringify(updates)
});
```

---

#### `getUserById(userId)`
**Propósito**: Obtiene información de un usuario específico

**Parámetros**:
- `userId` (string): ID del usuario

**Retorna**: `Object | null`

**Migración a Backend**:
```javascript
// Futuro
const response = await fetch(`/api/users/${userId}`);
const user = await response.json();
```

---

#### `getUserPosts(userId)`
**Propósito**: Obtiene las publicaciones de un usuario

**Parámetros**:
- `userId` (string): ID del usuario

**Retorna**: `Array<Object>`

---

#### `canEditPost(post)`, `canDeletePost(post)`, `canDeleteComment(comment)`
**Propósito**: Verifican permisos del usuario actual

**Retorna**: `boolean`

---

## PostService

### Responsabilidades
- Crear, leer, actualizar y eliminar publicaciones
- Gestionar likes
- Obtener feed de publicaciones

### Métodos Públicos

#### `createPost(content, imageFile)`
**Propósito**: Crea una nueva publicación

**Parámetros**:
- `content` (string): Contenido de la publicación (1-500 caracteres)
- `imageFile` (File, opcional): Imagen adjunta

**Retorna**: `Promise<Object>`
```javascript
{
  success: boolean,
  post: Object | null,
  message: string,
  error: string | null
}
```

**Migración a Backend**:
```javascript
// Futuro
const formData = new FormData();
formData.append('content', content);
if (imageFile) formData.append('image', imageFile);

await fetch('/api/posts', {
  method: 'POST',
  body: formData
});
```

---

#### `getFeed(limit, offset)`
**Propósito**: Obtiene el feed de publicaciones

**Parámetros**:
- `limit` (number, opcional): Cantidad de posts a obtener
- `offset` (number, opcional): Desde qué posición empezar

**Retorna**: `Promise<Array<Object>>`

**Migración a Backend**:
```javascript
// Futuro
const response = await fetch(`/api/posts/feed?limit=${limit}&offset=${offset}`);
const posts = await response.json();
```

---

#### `getPostById(postId)`
**Propósito**: Obtiene una publicación específica

**Parámetros**:
- `postId` (string): ID de la publicación

**Retorna**: `Object | null`

---

#### `deletePost(postId)`
**Propósito**: Elimina una publicación

**Parámetros**:
- `postId` (string): ID de la publicación

**Retorna**: `Promise<Object>`
```javascript
{
  success: boolean,
  message: string,
  error: string | null
}
```

**Migración a Backend**:
```javascript
// Futuro
await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
```

---

#### `likePost(postId)`
**Propósito**: Da like a una publicación

**Parámetros**:
- `postId` (string): ID de la publicación

**Retorna**: `Promise<Object>`

**Migración a Backend**:
```javascript
// Futuro
await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
```

---

## CommentService

### Responsabilidades
- Crear y eliminar comentarios
- Obtener comentarios de una publicación

### Métodos Públicos

#### `createComment(postId, content, imageFile)`
**Propósito**: Crea un comentario en una publicación

**Parámetros**:
- `postId` (string): ID de la publicación
- `content` (string): Contenido del comentario
- `imageFile` (File, opcional): Imagen adjunta

**Retorna**: `Promise<Object>`
```javascript
{
  success: boolean,
  comment: Object | null,
  message: string,
  error: string | null
}
```

**Migración a Backend**:
```javascript
// Futuro
const formData = new FormData();
formData.append('post_id', postId);
formData.append('content', content);
if (imageFile) formData.append('image', imageFile);

await fetch('/api/comments', {
  method: 'POST',
  body: formData
});
```

---

#### `getCommentsByPostId(postId)`
**Propósito**: Obtiene todos los comentarios de una publicación

**Parámetros**:
- `postId` (string): ID de la publicación

**Retorna**: `Array<Object>`

**Migración a Backend**:
```javascript
// Futuro
const response = await fetch(`/api/posts/${postId}/comments`);
const comments = await response.json();
```

---

#### `deleteComment(postId, commentId)`
**Propósito**: Elimina un comentario

**Parámetros**:
- `postId` (string): ID de la publicación
- `commentId` (string): ID del comentario

**Retorna**: `Promise<Object>`

---

## ChatService

### Responsabilidades
- Gestionar conversaciones
- Enviar y recibir mensajes
- Listar chats del usuario

### Métodos Públicos

#### `getConversations()`
**Propósito**: Obtiene todas las conversaciones del usuario actual

**Retorna**: `Promise<Array<Object>>`

**Migración a Backend**:
```javascript
// Futuro
const response = await fetch('/api/chats');
const chats = await response.json();
```

---

#### `getMessages(chatId)`
**Propósito**: Obtiene mensajes de una conversación

**Parámetros**:
- `chatId` (string): ID de la conversación

**Retorna**: `Array<Object>`

**Migración a Backend**:
```javascript
// Futuro
const response = await fetch(`/api/chats/${chatId}/messages`);
const messages = await response.json();
```

---

#### `sendMessage(chatId, content, imageFile)`
**Propósito**: Envía un mensaje en una conversación

**Parámetros**:
- `chatId` (string): ID de la conversación
- `content` (string): Contenido del mensaje
- `imageFile` (File, opcional): Imagen adjunta

**Retorna**: `Promise<Object>`
```javascript
{
  success: boolean,
  message: Object | null,
  error: string | null
}
```

**Migración a Backend**:
```javascript
// Futuro
await fetch(`/api/chats/${chatId}/messages`, {
  method: 'POST',
  body: JSON.stringify({ content, imageUrl })
});
```

---

## Formato de Respuesta Estándar

Todos los métodos async que realizan operaciones deben retornar:

```javascript
{
  success: boolean,      // Indica si la operación fue exitosa
  data: Object | null,   // Datos resultantes (user, post, comment, etc.)
  message: string,       // Mensaje descriptivo de éxito
  error: string | null   // Mensaje de error si success === false
}
```

---

## Formato de Objetos de Datos

### Usuario
```javascript
{
  id: string,
  tipoDoc: string,
  documento: string,
  nombre: string,
  apodo: string,
  trimestre: string,
  programa: string,
  profilePicture: string,
  bio: string,
  email: string,
  isLoggedIn: boolean
}
```

### Publicación
```javascript
{
  id: string,
  userId: string,
  author: Object,        // Objeto de usuario
  content: string,
  imageUrl: string | null,
  timestamp: string,     // ISO 8601
  likes: number,
  comments: Array<Object>
}
```

### Comentario
```javascript
{
  id: string,
  postId: string,
  userId: string,
  author: Object,
  content: string,
  imageUrl: string | null,
  timestamp: string
}
```

### Mensaje
```javascript
{
  id: string,
  chatId: string,
  senderId: string,
  content: string,
  imageUrl: string | null,
  timestamp: string,
  read: boolean
}
```

---

## Manejo de Errores

Todos los servicios deben usar `ErrorHandler` para normalizar errores:

```javascript
import { errorHandler } from '../utils/ErrorHandler.js';

try {
  // Operación
} catch (error) {
  const normalizedError = errorHandler.handleError(error, 'UserService.login');
  return {
    success: false,
    error: normalizedError.message,
    data: null
  };
}
```

---

## Uso de DataMapper

Al migrar a backend, usar `DataMapper` para convertir datos:

```javascript
import { dataMapper } from '../utils/DataMapper.js';

// De API a modelo interno
const response = await fetch('/api/users/123');
const apiUser = await response.json();
const user = dataMapper.mapUser(apiUser, 'api');

// De modelo interno a API
const userForAPI = dataMapper.mapUserToAPI(user);
await fetch('/api/users/123', {
  method: 'PUT',
  body: JSON.stringify(userForAPI)
});
```

---

## Notas de Implementación

1. **Interfaces estables**: Los nombres de métodos y estructura de respuestas NO cambiarán
2. **Implementación interna**: Solo cambia la implementación interna (localStorage → API)
3. **UI sin cambios**: Los componentes UI NO necesitan modificarse
4. **Retrocompatibilidad**: Los tests existentes seguirán funcionando
5. **Documentación viva**: Este documento se actualiza si cambian contratos

---

**Fecha de creación**: 2026-02-11  
**Estado**: Contratos estables y documentados
