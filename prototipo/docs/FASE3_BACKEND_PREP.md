# Fase 3: Preparación para Backend - Resumen

## Objetivo
Preparar el código frontend para una futura integración con backend (Firebase, API REST, etc.) sin requerir cambios en la UI.

---

## Implementación Completada

### ✅ 8. Capa de Servicios con Interfaz Estable

**Archivo**: `docs/CONTRATOS_SERVICIOS.md`

**Implementación**:
- Documentación completa de todos los métodos públicos de servicios
- Contratos con JSDoc detallado que define:
  - Parámetros con tipos y descripciones
  - Valores de retorno con estructura exacta
  - Ejemplos de uso
  - Notas de migración a backend

**Servicios Documentados**:
1. **UserService**: Autenticación y gestión de usuarios
   - `login()`, `logout()`, `getCurrentUser()`, `updateProfile()`, etc.
2. **PostService**: Gestión de publicaciones
   - `createPost()`, `getFeed()`, `deletePost()`, `likePost()`, etc.
3. **CommentService**: Gestión de comentarios
   - `createComment()`, `getCommentsByPostId()`, `deleteComment()`, etc.
4. **ChatService**: Gestión de conversaciones
   - `getConversations()`, `getMessages()`, `sendMessage()`, etc.

**Beneficio**: 
- Los desarrolladores de UI saben exactamente qué esperar de cada método
- La migración a backend solo requiere cambiar la implementación interna
- Los tests y la UI no necesitan modificarse

---

### ✅ 9. Adaptadores de Datos (Mapeo)

**Archivo**: `js/utils/DataMapper.js`

**Implementación**:
Clase `DataMapper` que centraliza el mapeo de datos entre diferentes formatos:

#### Métodos de Mapeo
```javascript
// Usuarios
mapUser(data, source)        // De cualquier fuente a modelo interno
mapUserToAPI(user)           // De modelo interno a API

// Publicaciones
mapPost(data, source)        
mapPostToAPI(post)

// Comentarios
mapComment(data, source)
mapCommentToAPI(comment)

// Conversaciones
mapChat(data, source)
mapMessage(data, source)

// Colecciones
mapCollection(items, type, source)  // Mapea arrays completos
```

#### Fuentes Soportadas
- `'mock'`: Datos de MockUsers (formato actual)
- `'localStorage'`: Datos guardados localmente
- `'api'`: Datos de API REST (formato futuro)

**Ejemplo de Uso**:
```javascript
// Mapear respuesta de API a modelo interno
const apiUser = await fetch('/api/users/123').then(r => r.json());
const user = dataMapper.mapUser(apiUser, 'api');

// Mapear modelo interno a formato API
const userForAPI = dataMapper.mapUserToAPI(user);
await fetch('/api/users/123', {
  method: 'PUT',
  body: JSON.stringify(userForAPI)
});
```

**Beneficio**:
- Un solo lugar para definir cómo se transforman los datos
- Facilita el cambio de estructura de API sin tocar lógica de negocio
- Mantiene el modelo interno consistente independiente de la fuente

---

### ✅ 10. Manejo Centralizado de Errores

**Archivo**: `js/utils/ErrorHandler.js`

**Implementación**:
Clase `ErrorHandler` que normaliza errores de cualquier fuente en un formato consistente.

#### Catálogo de Errores
Códigos estándar organizados por categoría:
- **Autenticación**: `AUTH_001` (credenciales inválidas), `AUTH_002` (usuario no encontrado), etc.
- **Validación**: `VAL_001` (campo requerido), `VAL_002` (formato inválido), etc.
- **Datos**: `DATA_001` (no encontrado), `DATA_002` (guardado fallido), etc.
- **Red/API**: `NET_001` (error de red), `NET_003` (error de API), etc.
- **Permisos**: `PERM_001` (acceso denegado), etc.

#### Formato de Error Normalizado
```javascript
{
  code: string,           // Código del catálogo (ej: 'AUTH_001')
  message: string,        // Mensaje en español
  action: string,         // Acción sugerida al usuario
  details: Object,        // Detalles adicionales
  timestamp: string       // ISO 8601
}
```

#### Métodos Principales
```javascript
// Crear error desde catálogo
createError(code, customMessage, details)

// Normalizar cualquier error
handleError(error, context)

// Procesar errores HTTP
handleHTTPError(response, data)

// Errores de validación
handleValidationErrors(validationErrors)

// Logging (preparado para servicio remoto)
logError(error, severity)
```

**Ejemplo de Uso**:
```javascript
try {
  // Operación
} catch (error) {
  const normalizedError = errorHandler.handleError(error, 'UserService.login');
  errorHandler.logError(normalizedError, 'medium');
  
  return {
    success: false,
    error: normalizedError.message
  };
}
```

**Beneficio**:
- Errores consistentes en toda la aplicación
- Mensajes amigables en español
- Preparado para integración con servicio de logging
- Se alinea con respuestas de API REST estándar

---

## Integración en Servicios

### UserService Actualizado

**Cambios Realizados**:
1. Importación de ErrorHandler y DataMapper
2. JSDoc completo en todos los métodos
3. Manejo de errores normalizado
4. Mapeo de usuarios con DataMapper
5. Comentarios TODO para migración a backend

**Ejemplo - Método `login()` Mejorado**:
```javascript
async login(tipoDoc, documento, password) {
  try {
    // Validación con ErrorHandler
    if (!isValidDocument(tipoDoc, documento)) {
      const error = errorHandler.createError(
        errorHandler.ERROR_CODES.VALIDATION_FORMAT,
        'Documento inválido'
      );
      return { success: false, error: error.message, user: null };
    }

    // TODO BACKEND: Reemplazar por fetch('/api/auth/login')
    const mockUser = validateCredentials(tipoDoc, documento, password);
    
    if (!mockUser) {
      const error = errorHandler.createError(
        errorHandler.ERROR_CODES.AUTH_INVALID_CREDENTIALS
      );
      errorHandler.logError(error, 'low');
      return { success: false, error: error.message, user: null };
    }

    // Mapeo con DataMapper
    const user = dataMapper.mapUser(
      { ...mockUser, isLoggedIn: true },
      'mock'
    );

    // Guardar
    appState.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    return {
      success: true,
      user: user,
      message: 'Acceso confirmado. Bienvenido(a) a la Red Social SENA.'
    };
    
  } catch (error) {
    const normalizedError = errorHandler.handleError(error, 'UserService.login');
    errorHandler.logError(normalizedError, 'medium');
    
    return {
      success: false,
      error: normalizedError.message,
      user: null
    };
  }
}
```

---

## Ruta de Migración a Backend

### Paso 1: Implementar Backend
- Crear endpoints en API REST o Firebase
- Definir estructura de datos (puede ser diferente al frontend)

### Paso 2: Actualizar Solo los Servicios
```javascript
// ANTES (localStorage)
const mockUser = validateCredentials(tipoDoc, documento, password);

// DESPUÉS (API)
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tipoDoc, documento, password })
});
const apiUser = await response.json();
const user = dataMapper.mapUser(apiUser, 'api');
```

### Paso 3: La UI No Cambia
- Los componentes siguen llamando a `userService.login()`
- Reciben la misma estructura de respuesta
- El comportamiento es transparente

---

## Archivos Creados

```
prototipo/
├── js/utils/
│   ├── ErrorHandler.js       (10.9 KB) → Manejo de errores
│   └── DataMapper.js          (11.7 KB) → Mapeo de datos
└── docs/
    └── CONTRATOS_SERVICIOS.md (10.5 KB) → Documentación de contratos
```

---

## Archivos Modificados

```
prototipo/js/services/
└── UserService.js → Integrado ErrorHandler, DataMapper y JSDoc completo
```

---

## Próximas Acciones

### Aplicar a Otros Servicios
- [ ] PostService: Integrar ErrorHandler y DataMapper
- [ ] CommentService: Integrar ErrorHandler y DataMapper
- [ ] ChatService: Integrar ErrorHandler y DataMapper

### Testing
- [ ] Verificar que login funcione con nuevos cambios
- [ ] Verificar que errores se muestren correctamente
- [ ] Probar mapeo de datos

---

## Ventajas de Esta Arquitectura

1. **Separación de Responsabilidades**
   - UI solo conoce contratos, no implementación
   - Servicios manejan lógica de negocio
   - Mappers manejan transformación de datos
   - ErrorHandler maneja errores

2. **Mantenibilidad**
   - Cambios en estructura de API no afectan UI
   - Errores consistentes facilitan debugging
   - Documentación clara de qué hace cada método

3. **Escalabilidad**
   - Fácil agregar nuevos tipos de errores
   - Fácil soportar nuevas fuentes de datos
   - Preparado para múltiples backends

4. **Testabilidad**
   - Servicios pueden probarse independientemente
   - Mappers tienen entrada/salida predecible
   - Errores normalizados facilitan assertions

---

**Fecha de implementación**: 2026-02-11  
**Estado**: ✅ Fase 3 completada  
**Siguiente**: Aplicar cambios a PostService, CommentService y ChatService
