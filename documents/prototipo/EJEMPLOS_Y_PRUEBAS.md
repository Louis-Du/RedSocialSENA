# Ejemplos de Uso y Casos de Prueba

## 🎯 Casos de Uso Soportados

### 1. Autenticación

#### Usuario se loga
```javascript
// En consola o AuthManager
const result = await userService.login('CC', '1234567890', 'sena123');
// Resultado: { success: true, user: {...} }
// Cambia a vista de app
// Carga feed inicial
```

#### Usuario cierra sesión
```javascript
await userService.logout();
// Limpia localStorage
// Vuelve a login
// Resetea todo el estado
```

#### Verificar sesión persistente
```javascript
// Al recargar página
if (userService.isLoggedIn()) {
    // Muestra app
    // Carga feed
} else {
    // Muestra login
}
```

---

### 2. Crear Publicación

#### Con solo texto
```javascript
const result = await postService.createPost('Hola a todos!', null);
// result: { success: true, post: {...}, message: '...' }
```

#### Con imagen
```javascript
const fileInput = document.querySelector('input[type="file"]');
const imageFile = fileInput.files[0];

const result = await postService.createPost(
    'Mira esta foto',
    imageFile
);
```

#### Con validación fallida
```javascript
const result = await postService.createPost('', null);
// result: { success: false, error: 'Debes escribir algo...', post: null }
```

---

### 3. Comentarios

#### Añadir comentario
```javascript
const result = await commentService.addComment(
    postId,
    'Qué interesante!',
    null
);

if (result.success) {
    // Renderizar nuevo comentario
    feedRenderer.renderComments(postId);
}
```

#### Obtener comentarios
```javascript
const comments = commentService.getComments(postId);
// [{ id, userId, content, ... }, ...]
```

#### Eliminar comentario
```javascript
if (commentService.canDeleteComment(postId, commentId)) {
    const result = await commentService.deleteComment(postId, commentId);
}
```

---

### 4. Chat

#### Obtener conversaciones
```javascript
const conversations = chatService.getAllConversations();
// [
//   { user: {...}, messageCount: 5, lastMessage: {...} },
//   ...
// ]
```

#### Enviar mensaje (primer mensaje)
```javascript
const state = chatService.getChatState(userId);
if (state.isFirstMessage) {
    // Solo texto permitido
    const result = await chatService.sendMessage(userId, 'Hola!', null);
}
```

#### Enviar mensaje con imagen (después del primero)
```javascript
if (state.canSendImages) {
    const result = await chatService.sendMessage(
        userId,
        'Mira esto',
        imageFile
    );
}
```

#### Obtener mensajes
```javascript
const messages = chatService.getMessages(userId);
// Automáticamente enriquecidos con info del autor
```

---

### 5. Perfil

#### Obtener usuario actual
```javascript
const user = userService.getCurrentUser();
// { id, nombre, apodo, trimestre, programa, ... }
```

#### Obtener otro usuario
```javascript
const otherUser = userService.getUserById(userId);
// { id, nombre, apodo, ... }
```

#### Actualizar perfil
```javascript
const result = await userService.updateProfile({
    bio: 'Aprendiz apasionado por la programación',
    profilePicture: dataUrl
});
```

---

## 🧪 Pruebas Manuales

### Test 1: Flujo Completo de Usuario

```
1. Abrir navegador (limpio, sin sesión)
2. Ver login
3. Ingresar: CC, 1234567890, sena123
4. Ver app con feed vacío
5. Crear post "Mi primer post!"
6. Ver post en feed
7. Escribir comentario "¡Qué genial!"
8. Ver comentario en post
9. Eliminar comentario
10. Ir a chats
11. Seleccionar usuario
12. Enviar primer mensaje "Hola"
13. No poder enviar imagen en primer mensaje
14. Verificar en consola: window.__APP__.appState.chats
15. Logout
16. Verificar login vacío (localStorage limpio)
```

### Test 2: Validaciones

```
1. Intenta crear post vacío
   → Debe mostrar error
   
2. Intenta crear comentario vacío
   → Debe mostrar error
   
3. Intenta enviar mensaje vacío
   → Debe mostrar error
   
4. Intenta subir archivo >5MB
   → Debe mostrar error
   
5. Intenta eliminar post sin confirmación
   → Debe mostrar confirmación
```

### Test 3: Persistencia

```
1. Crear un post "Test persistencia"
2. Recargar la página
3. El post debe seguir ahí
4. Verificar localStorage: JSON.parse(localStorage.getItem('appState'))
5. Crear comentario
6. Recargar
7. Comentario persiste
```

### Test 4: Autorización

```
1. Crear post como usuario "Aprendiz SENA"
2. Verificar que tiene botón de eliminar
3. (Si hubiera otro usuario) Ver que NO tiene botón de eliminar
4. Comentar en otro post
5. Ver que tiene botón de eliminar su comentario
6. (Si fuera otro usuario) No vería botón de eliminar
```

### Test 5: Responsive

```
Mobile (<640px):
- Login aparece responsive
- Feed en una columna
- Tabs de perfil aparecen como botones
- Chat list se minimiza

Tablet (640px - 1024px):
- Layout de 2 columnas
- Sidebar visible
- Buttons visibles

Desktop (>1024px):
- Layout completo
- Sidebar completo
- Perfil con nav lateral
```

---

## 🔍 Debugging

### Ver Estado Completo

```javascript
window.__APP__.appState.getDebugState()

// Retorna:
{
  currentUser: {...},
  postsCount: 5,
  commentsCount: 2,
  chatsCount: 3,
  posts: [...],
  comments: {...},
  chats: {...}
}
```

### Ver Un Post Específico

```javascript
window.__APP__.appState.getPostById(postId)

// O con detalles:
window.__APP__.postService.getPostWithDetails(postId)
```

### Ver Conversación

```javascript
window.__APP__.chatService.getConversationState(userId)

// Retorna:
{
  otherUser: {...},
  messageCount: 5,
  lastMessage: {...},
  messages: [...]
}
```

### Recargar Feed

```javascript
window.reloadFeed()

// Equivalente a:
const posts = await window.__APP__.postService.getFeed();
window.__APP__.feedRenderer.renderFeed(posts);
```

### Crear Datos de Prueba

```javascript
// Crear varios posts
for (let i = 0; i < 5; i++) {
  await window.__APP__.postService.createPost(`Post ${i}`);
}

// Crear comentarios
const posts = window.__APP__.appState.posts;
posts.forEach(post => {
  await window.__APP__.commentService.addComment(post.id, 'Genial!');
});

// Enviar mensajes
await window.__APP__.chatService.sendMessage('user_2', 'Primer mensaje');
await window.__APP__.chatService.sendMessage('user_2', 'Segundo mensaje');
```

---

## 📋 Checklist de Verificación

- [ ] Login funciona
- [ ] Logout funciona
- [ ] Crear post funciona
- [ ] Imagen en post funciona
- [ ] Comentar funciona
- [ ] Eliminar comentario funciona
- [ ] Eliminar post funciona
- [ ] Chat funciona
- [ ] Primer mensaje solo texto
- [ ] Persistencia funciona
- [ ] Responsive funciona
- [ ] Validaciones funcionan
- [ ] Error messages aparecen
- [ ] Tabs de perfil funcionan
- [ ] Navegación funciona

---

## 🚀 Performance

### Monitoreo

```javascript
// Performance entry
performance.mark('start');
// ... operación ...
performance.mark('end');
performance.measure('my-measure', 'start', 'end');

// Ver en DevTools
performance.getEntriesByType('measure')
```

### Optimizaciones Realizadas

- ✅ Event delegation (menos listeners)
- ✅ No re-renders innecesarios
- ✅ Caché en AppState
- ✅ Data URLs en memoria
- ✅ Lazy loading de componentes

---

## 🐛 Errores Comunes

### Error: "Cannot read property 'appendChild' of null"
```
Causa: DOM elemento no existe
Solución: Verificar que index.html tiene IDs correctos
```

### Error: "localStorage is full"
```
localStorage.clear()
location.reload()
```

### Error: "Cannot read property 'getPostById' of undefined"
```
Causa: Módulos no cargaron
Solución: Verificar que main.js se carga con type="module"
```

### "No aparecen posts"
```
Verificar:
- ¿Usuario está logueado? userService.isLoggedIn()
- ¿Hay posts? appState.posts
- ¿Feed se renderiza? feedRenderer.renderFeed(posts)
```

---

## 📞 Support

### Si algo no funciona:

1. **Abre Console** (F12)
2. **Verifica errores** en la pestaña Console
3. **Ejecuta debug:**
   ```javascript
   window.__APP__.appState.getDebugState()
   ```
4. **Revisa localStorage:**
   ```javascript
   JSON.parse(localStorage.getItem('appState'))
   ```
5. **Limpia y recarga:**
   ```javascript
   localStorage.clear()
   location.reload()
   ```

---

**Última actualización:** 9 de febrero de 2026
