# 🔥 Actualización: Posts en Tiempo Real con Firestore

## ✅ Cambios Implementados

He refactorizado el sistema de publicaciones para usar **Firebase Firestore** en lugar de `appState` local. Ahora las publicaciones se sincronizan en **tiempo real** entre todos los dispositivos.

---

## 📁 Archivos Modificados

### 1. **PostService.js** (Refactorizado completamente)
- ✅ `createPost()` - Escribe a Firestore + Storage para imágenes
- ✅ `listenToPosts()` - Listener en tiempo real con `onSnapshot`
- ✅ `getPosts()` - Obtiene posts sin listener
- ✅ `getPostById()` - Ahora es `async`
- ✅ `toggleUpvote()` / `toggleDownvote()` - Usa `increment()` de Firestore
- ✅ `updatePost()` / `deletePost()` - Operaciones CRUD completas
- ✅ `cleanup()` - Limpia listeners activos

### 2. **FeedRenderer.js** (Actualizado)
- ✅ `renderFullFeed()` - Ahora usa `listenToPosts()` para sincronización RT
- ✅ `cleanup()` - Limpia listener cuando se desmonta
- ✅ `handleUpvote()` / `handleDownvote()` - Optimizados para RT

### 3. **FIRESTORE_RULES.js** (Extendido)
- ✅ Reglas de seguridad para colección `posts`
- ✅ Validación de creador (solo autor puede editar/eliminar)
- ✅ Votaciones permitidas para usuarios autenticados

---

## 🔧 Configuración Requerida

### Paso 1: Actualizar Reglas de Firestore

1. Ve a [Firebase Console → Firestore → Rules](https://console.firebase.google.com/project/red-social-sena/firestore/rules)

2. **Copia el contenido del archivo `FIRESTORE_RULES.js`** (todo el archivo)

3. **Pega** en el editor de reglas de Firebase Console

4. Haz clic en **"Publicar"**

### Paso 2: Habilitar Storage (si aún no está)

1. Ve a [Firebase Console → Storage](https://console.firebase.google.com/project/red-social-sena/storage)

2. Si no está habilitado, haz clic en **"Comenzar"**

3. Configura las reglas de Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imágenes de posts
    match /post-images/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
    
    // Imágenes de chat (ya existente)
    match /chat-images/{chatId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

4. Haz clic en **"Publicar"**

---

## 🧪 Prueba del Sistema

### Test 1: Crear Publicación desde el Celular
1. Abre la app en el celular
2. Crea una publicación con texto
3. **Resultado esperado**: La publicación aparece en el PC **automáticamente** sin recargar

### Test 2: Dar Like desde el PC
1. En el PC, da clic en el botón de upvote de una publicación
2. Observa el celular
3. **Resultado esperado**: El contador de votos se actualiza **en tiempo real** en ambos dispositivos

### Test 3: Publicación con Imagen
1. Crea una publicación con imagen desde cualquier dispositivo
2. **Resultado esperado**: La imagen se sube a Storage y aparece en todos los dispositivos

### Test 4: Eliminar Publicación
1. Elimina una publicación que creaste
2. **Resultado esperado**: Desaparece de todos los dispositivos conectados

---

## 📊 Estructura de Datos en Firestore

### Colección: `posts`

```javascript
{
  "userId": "abc123",              // UID del creador
  "content": "Mi publicación",     // Texto del post
  "imageUrl": "https://...",       // URL de Storage (opcional)
  "votes": {
    "upvotes": 5,
    "downvotes": 2,
    "usersVoted": {
      "user1": "up",
      "user2": "down",
      "user3": "up"
    }
  },
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

## 🐛 Troubleshooting

### Problema: No se crean publicaciones
**Solución:**
- Verifica que hayas publicado las reglas de Firestore
- Verifica que el usuario esté autenticado (`auth.currentUser` no null)
- Revisa la consola del navegador (F12) para errores

### Problema: Las publicaciones no aparecen en otros dispositivos
**Solución:**
- Recarga ambos dispositivos
- Verifica que ambos estén usando la **misma URL** (misma IP local)
- Verifica que el listener esté activo (debería iniciarse al cargar el feed)

### Problema: No se pueden subir imágenes
**Solución:**
- Verifica que hayas configurado Storage Rules
- Verifica que el archivo sea menor a 5MB
- Verifica que sea una imagen válida (JPEG, PNG, GIF, WebP)

### Problema: Error "Permission denied"
**Solución:**
- Revisa las reglas de Firestore en la consola
- Asegúrate de que el usuario esté autenticado
- Verifica que las reglas incluyan la colección `posts`

---

## 🔄 Migración de Datos Antiguos

Si tenías publicaciones en `appState` (solo locales), **esas no se migrarán automáticamente** porque estaban en memoria.

Para migrar datos antiguos a Firestore:

1. Exporta los datos de `appState` (si los necesitas)
2. Usa el método `createPost()` para cada publicación antigua
3. O simplemente empieza de cero (recomendado para testing)

---

## 🎯 Próximos Pasos

### Pendiente de Implementar:
- [ ] **Comentarios en Firestore** (actualmente usan `appState`)
- [ ] **UserService en Firestore** (perfiles de usuarios)
- [ ] **Búsqueda y filtros** optimizados con índices compuestos
- [ ] **Paginación** para feeds con muchos posts
- [ ] **Notificaciones** cuando alguien comenta/vota

---

## 📚 Recursos

- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
- [onSnapshot Real-time Updates](https://firebase.google.com/docs/firestore/query-data/listen)

---

**Última actualización:** 13 de febrero de 2026  
**Estado:** ✅ Listo para testing
