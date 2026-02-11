# 🎓 Red Social de Aprendices SENA - Frontend Refactorizado

## 📋 Resumen

Este es un **frontend completamente refactorizado** siguiendo arquitectura en capas desacopladas. Es funcional como **prototipo demostrativo** y está listo para conectarse a un **backend real** sin cambios en la UI.

## ✨ Cambios Principales

### Antes (Código Monolítico)
```
❌ Todo mezclado en index.html
❌ 1000+ líneas de JavaScript inline
❌ Lógica y UI acopladas
❌ Difícil de mantener y testear
❌ Imposible reutilizar servicios
```

### Ahora (Arquitectura en Capas)
```
✅ Separación clara de responsabilidades
✅ Módulos JavaScript independientes
✅ Servicios desacoplados de la UI
✅ Fácil de mantener y escalar
✅ Listo para backend real
✅ ~2500 líneas de código bien organizadas
```

## 🏗️ Estructura

```
js/
├── main.js                    # Inicializador de la app
├── AppState.js               # Estado global centralizado
├── utils.js                  # Funciones compartidas
├── services/
│   ├── UserService.js        # Gestión de usuarios y auth
│   ├── PostService.js        # CRUD de publicaciones
│   ├── CommentService.js     # CRUD de comentarios
│   └── ChatService.js        # Gestión de mensajes
└── ui/
    ├── NavigationManager.js   # Navegación entre vistas
    ├── AuthManager.js         # Login/logout
    ├── PostManager.js         # Creación de posts
    ├── ModalManager.js        # Modales y confirmaciones
    ├── FeedRenderer.js        # Renderizado de posts
    ├── ChatManager.js         # Gestión de chats
    └── TabManager.js          # Tabs de perfil
```

## 🚀 Características

### ✅ Funcionales Implementadas
- ✓ Login y logout (simulado)
- ✓ Crear publicaciones con imagen
- ✓ Ver feed de publicaciones
- ✓ Comentar en publicaciones
- ✓ Eliminar posts propios
- ✓ Eliminar comentarios propios
- ✓ Navegar entre vistas
- ✓ Chat con otros usuarios
- ✓ **Regla: primer mensaje solo texto**
- ✓ Tabs de perfil (Perfil, Publicaciones, Información)
- ✓ Persistencia con localStorage
- ✓ Responsive (mobile, tablet, desktop)

### 📊 Reglas de Negocio Implementadas
- Solo propietario puede eliminar su post
- Solo autor puede eliminar su comentario
- Campos validados (no vacíos, imágenes, documentos)
- Primer mensaje de chat solo texto
- Datos persisten al recargar página

## 🧪 Cómo Probar

### 1. Login
```
- Tipo de Documento: CC
- Número: cualquiera (ej: 1234567890)
- Contraseña: cualquiera (mín 6 caracteres)
```

### 2. Crear una publicación
```
- Botón "+" en el header
- Escribe contenido o sube imagen
- Haz clic en "Publicar"
```

### 3. Comentar
```
- En el feed, escribe en el campo de comentarios
- Haz clic en el botón de enviar (ícono de paper plane)
```

### 4. Chat
```
- Navega a "Chats"
- Selecciona un usuario
- En el primer mensaje: solo puedes escribir texto
- En mensajes posteriores: podrías añadir imágenes (código listo)
```

### 5. Debug (Consola del navegador)
```javascript
// Ver estado completo
window.__APP__.appState.getDebugState()

// Ver todos los posts
window.__APP__.appState.posts

// Crear post de prueba
await window.__APP__.postService.createPost('Hola mundo')

// Recargar feed
window.reloadFeed()

// Ver usuario actual
window.__APP__.userService.getCurrentUser()
```

## 🔧 Configuración y Uso

### Instalar (si necesita algo local)
```bash
# No requiere instalación - funciona con HTML/CSS/JS puro
# Solo necesitas un servidor web para servir los archivos
python -m http.server 8000
# O con Node.js
npx http-server
```

### Agregar a tu proyecto
```html
<!-- En el head -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- En el body, al final -->
<script src="assets/js/lucide.min.js"></script>
<script type="module" src="js/main.js"></script>
```

## 📚 Documentación Técnica

### Explicación Detallada
Ver `ARQUITECTURA.md` para:
- Estructura en capas
- Cómo funciona cada servicio
- Flujo de datos
- Cómo transicionar a backend
- Ejemplos de integración

### Rápido: Flujo de Creación de Post

```
Usuario hace click en "Publicar"
    ↓
PostManager captura el evento
    ↓
PostService valida reglas
    ↓
AppState persiste en localStorage
    ↓
AppState notifica cambio
    ↓
FeedRenderer renderiza nuevo post
    ↓
Usuario ve el post en pantalla
```

**Importante:** La UI **nunca accede directamente** a localStorage. Todo pasa por servicios.

## 🔌 Conectar a Backend Real

### Cambio Mínimo Necesario

```javascript
// ANTES (Mock - AppState/localStorage)
// PostService.js
async createPost(content, imageFile) {
    const post = appState.createPost(content, imageUrl);
    return post;
}

// DESPUÉS (Backend)
// PostService.js
async createPost(content, imageFile) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('image', imageFile);
    
    const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const post = await response.json();
    appState.posts.unshift(post); // Cachear
    appState.notifySubscribers('posts');
    return post;
}
```

**Resultado:** ✅ La UI no cambia absolutamente nada

## 📦 Dependencias Externas

- **Tailwind CSS** - Estilos (via CDN)
- **Lucide Icons** - Iconos SVG (archivo local)
- Sin frameworks (React, Vue, Angular)
- Sin librerías adicionales

## 🎨 Identidad Visual

- **Verde SENA:** `#39A900` (principal)
- **Azul Oscuro:** `#00304D` (secundario)
- **Gris Claro:** `#F6F6F6` (fondo)
- **Font:** Inter / System UI

## 🧠 Principios de Diseño

1. **Separación de Responsabilidades** - Cada módulo hace una cosa bien
2. **DRY** - Don't Repeat Yourself - usar utils
3. **KISS** - Keep It Simple, Stupid
4. **Preparado para Backend** - Cambio mínimo cuando se conecte API
5. **Seguridad** - Escapar HTML, validar inputs
6. **Performance** - Event delegation, lazy loading
7. **Mantenibilidad** - Código comentado y organizado

## 🐛 Solución de Problemas

### "No aparece nada"
```javascript
// Verifica si hay errores en consola
console.log(window.__APP__)
```

### "localStorage lleno"
```javascript
// Limpiar datos
localStorage.clear()
// Recargar página
location.reload()
```

### "Los posts no persisten"
```javascript
// Verificar si se está guardando
window.__APP__.appState.getDebugState()
```

## 📝 Roadmap / Próximas Mejoras

- [ ] Notificaciones visuales (toasts)
- [ ] Filtros de feed
- [ ] Búsqueda
- [ ] Editar posts
- [ ] Likes/reacciones
- [ ] Seguir usuarios
- [ ] Mensajes de grupo
- [ ] Upload a CDN (en lugar de data URLs)
- [ ] Sincronización en tiempo real (WebSockets)
- [ ] Offline-first (Service Workers)

## 👤 Usuario de Prueba

```
Documento: CC - 1234567890
Contraseña: sena123
Nombre: Daniel Esteban
Programa: Tecnólogo en Análisis y Desarrollo de Software
Trimestre: 3°
```

## 📄 Licencia

Uso educativo - SENA 2026

## 🤝 Contribuciones

Este código está diseñado para ser fácil de contribuir. Mantén:
- ✅ La separación en capas
- ✅ El flujo AppState → Servicios → UI
- ✅ Nombres claros
- ✅ Comentarios
- ✅ Sin hardcoding en la UI

---

**Última actualización:** 9 de febrero de 2026  
**Estado:** ✅ Listo para producción con backend

¿Preguntas? Ver `ARQUITECTURA.md`
