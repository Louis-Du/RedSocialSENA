# Fase 4 (Extensión) - Corrección de Identidad y Congruencia

## Problema Identificado

El sistema no distinguía claramente entre:
- **currentUser**: Usuario autenticado (quien está usando la app)
- **viewedUser**: Usuario cuyo perfil se está visualizando

Esto causaba:
- Al hacer clic en el nombre de un autor de publicación, se mostraban datos incorrectos
- No se podían ver perfiles de otros usuarios correctamente
- Las publicaciones no siempre mostraban el autor correcto

## Solución Implementada

### 1. NavigationManager - Soporte para Query Params

**Archivo**: `prototipo/js/ui/NavigationManager.js`

**Cambios**:
- ✅ Método `parseHash(hash)`: Extrae query params del hash (#profile?userId=123)
- ✅ Método `buildHash(view, params)`: Construye hash con query params
- ✅ Método `handleHashChange()`: Actualizado para pasar params a las vistas
- ✅ Método `showView()`: Recibe y propaga params a los event listeners
- ✅ Método `navigateToProfile(userId)`: Navega al perfil propio o de otro usuario
- ✅ Método `getNavigationParams()`: Retorna params actuales de navegación

**Impacto**:
- Ahora se soportan rutas como: `#profile` (perfil propio) y `#profile?userId=user_2` (perfil de otro)
- La navegación es consistente en toda la app

### 2. ProfileManager - Distinción currentUser vs viewedUser

**Archivo**: `prototipo/js/ui/ProfileManager.js`

**Cambios**:
- ✅ Propiedad `viewedUserId`: Guarda ID del usuario siendo visualizado
- ✅ Propiedad `isOwnProfile`: Boolean que indica si es perfil propio
- ✅ Método `loadProfile(userId)`: Carga perfil propio o de otro usuario
- ✅ Método `loadProfileData(user)`: Recibe el usuario a mostrar (no asume currentUser)
- ✅ Método `updateEditControls()`: Muestra/oculta controles de edición según contexto
- ✅ Método `loadUserPosts(userId)`: Carga publicaciones del usuario correspondiente
- ✅ Campos de formulario: Se marcan como readonly cuando no es perfil propio
- ✅ Botones de guardar: Se ocultan cuando no es perfil propio
- ✅ Sección de seguridad: Solo visible para perfil propio

**Impacto**:
- El perfil muestra correctamente los datos del usuario correspondiente
- Solo se puede editar el perfil propio
- Se pueden ver perfiles de otros usuarios sin posibilidad de modificarlos

### 3. FeedRenderer - Navegación a Perfil de Autor

**Archivo**: `prototipo/js/ui/FeedRenderer.js`

**Cambios**:
- ✅ Import de `navigationManager`
- ✅ Event listener para clicks en `.view-other-profile`
- ✅ Método `handleViewProfile(userId)`: Navega al perfil del usuario
- ✅ Atributo `data-user-id` en div de autor: Identifica al autor del post

**Impacto**:
- Al hacer clic en el nombre del autor, se navega correctamente a su perfil
- La navegación utiliza el userId del post (authorId)

### 4. Datos por Defecto

**Confirmado en**: `prototipo/js/AppState.js`

**Estado actual**:
- ✅ `posts: []` - Sin publicaciones hardcodeadas
- ✅ `comments: {}` - Sin comentarios hardcodeados
- ✅ `chats: {}` - Sin chats hardcodeados
- ✅ `users: [...]` - Solo usuarios simulados (fuente de identidad)

**Impacto**:
- El feed inicia vacío (usa estado vacío existente)
- Los chats inician vacíos (muestra "No hay conversaciones activas")
- Solo se crean datos cuando el usuario lo hace

### 5. Validación de authorId en Posts

**Confirmado en**: `prototipo/js/AppState.js`

```javascript
createPost(content, imageUrl = null) {
    const post = {
        id: generateId(),
        userId: this.currentUser.id, // ✅ SIEMPRE incluye userId
        content,
        imageUrl,
        createdAt: new Date().toISOString(),
        // ...
    };
}
```

**Impacto**:
- Todas las publicaciones tienen obligatoriamente `userId` (authorId)
- Se garantiza trazabilidad de autor en cada post

## Resultado Esperado

### Flujo de Uso

1. **Usuario se autentica** → `currentUser` se establece
2. **Usuario crea una publicación** → Post incluye `userId: currentUser.id`
3. **Usuario ve el feed** → Todas las publicaciones muestran autor correcto
4. **Usuario hace clic en nombre de autor** → Navega a:
   - `#profile` si es su propia publicación
   - `#profile?userId=X` si es publicación de otro usuario
5. **Se carga el perfil** → ProfileManager:
   - Identifica si es `isOwnProfile` (comparando viewedUserId con currentUser.id)
   - Carga datos del usuario correspondiente
   - Filtra publicaciones del usuario
   - Muestra/oculta controles de edición según contexto

### Validación

- [x] Hacer clic en el autor de una publicación muestra su perfil correcto
- [x] #profile muestra perfil propio
- [x] #profile?userId=X muestra perfil de otro usuario
- [x] Solo se puede editar el perfil propio
- [x] Las publicaciones se filtran por usuario en el perfil
- [x] Feed vacío muestra estado vacío
- [x] Chats vacíos muestran mensaje inicial

## Arquitectura Mantenida

- ✅ Sin backend
- ✅ Sin frameworks adicionales
- ✅ Compatible con GitHub Pages
- ✅ Respeta servicios existentes (UserService, PostService, ChatService)
- ✅ Respeta utilidades (DataMapper, ErrorHandler, NavigationGuard)

## Próximos Pasos

Una vez validada esta corrección, continuar con:
- **Fase 5**: Calidad y consistencia del código (propuestas 14-16)
- **Fase 6**: Accesibilidad y usabilidad (propuestas 17-18)
- **Fase 7**: Rendimiento y estabilidad (propuestas 19-20)
- **Fase 8**: QA y validación (propuestas 21-22)
