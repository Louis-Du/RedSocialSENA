# Arquitectura - Red Social SENA

## Patrón: Modular por Dominio

La aplicación sigue una **arquitectura modular por dominio**. Cada feature es autónoma, sin estado global compartido.

```
src/
├── index.html
├── utils.js              ← Re-export de utils/utils.js (compatibilidad)
├── core/
│   ├── bootstrap.js      ← Monta vistas HTML, lanza main.js
│   └── main.js           ← Entry point: inicializa módulos y suscripciones
├── modules/
│   ├── auth/             ← Dominio: autenticación y perfiles
│   │   ├── authState.js          (estado encapsulado del usuario)
│   │   ├── userService.js        (lógica de negocio)
│   │   ├── userRepository.js     (abstracción de fuente de datos)
│   │   ├── userFirebase.js       (implementación Firebase)
│   │   ├── userLocal.js          (implementación localStorage)
│   │   ├── AuthManager.js        (UI: login/logout)
│   │   ├── RegisterManager.js    (UI: registro)
│   │   ├── ProfileManager.js     (UI: perfil propio)
│   │   ├── OtherProfileManager.js(UI: perfil ajeno)
│   │   └── index.js
│   ├── post/             ← Dominio: publicaciones y feed
│   │   ├── postState.js          (estado de posts y filtros)
│   │   ├── postService.js        (lógica de negocio)
│   │   ├── postRepository.js     (abstracción)
│   │   ├── postFirebase.js       (implementación Firebase)
│   │   ├── postLocal.js          (implementación localStorage)
│   │   ├── FeedRenderer.js       (UI: renderizado del feed)
│   │   ├── PostManager.js        (UI: crear/eliminar posts)
│   │   ├── CommentService.js     (lógica de comentarios)
│   │   ├── FilterManager.js      (UI: filtros de feed)
│   │   ├── FeedControlsManager.js(UI: controles del feed)
│   │   ├── TabManager.js         (UI: tabs del feed)
│   │   ├── SearchManager.js      (UI: búsqueda)
│   │   ├── NewsManager.js        (UI: noticias SENA)
│   │   ├── MockNews.js           (datos mock de noticias)
│   │   └── index.js
│   ├── chat/             ← Dominio: chats privados y grupales
│   │   ├── chatState.js          (estado de chats y mensajes)
│   │   ├── chatService.js        (lógica de negocio)
│   │   ├── chatRepository.js     (abstracción)
│   │   ├── chatFirebase.js       (implementación Firebase)
│   │   ├── chatLocal.js          (implementación localStorage)
│   │   ├── ChatManager.js        (UI: lista de chats)
│   │   └── index.js
│   └── common/           ← Utilidades compartidas entre dominios
│       ├── MessageManager.js     (notificaciones UI globales)
│       ├── ModalManager.js       (modales)
│       ├── NavigationManager.js  (navegación entre vistas)
│       └── index.js
├── utils/
│   ├── utils.js          ← Helpers genéricos (escape, fechas, storage, validaciones)
│   ├── ButtonHelper.js   ← Estados de carga en botones
│   ├── FormValidator.js  ← Validación de formularios
│   └── UIComponents.js   ← Componentes HTML reutilizables
└── assets/
    ├── css/              ← Estilos globales y Tailwind
    ├── noticias/         ← Imágenes de noticias
    └── placeholders/     ← SVGs de placeholder
```

## Principios de la Arquitectura

### 1. Encapsulación por Dominio
Cada módulo (`auth`, `post`, `chat`) gestiona su propio estado. No existe estado global (`AppState` fue eliminado).

### 2. Capas dentro de cada Módulo
```
[Manager UI] → [Service] → [Repository] → [Firebase | Local]
                    ↕
                 [State]
```

### 3. Reglas de Dependencia
- ✅ Un módulo puede importar de `common/` y `utils/`
- ✅ Un módulo puede importar de su propia carpeta
- ❌ Un módulo NO debe importar del estado de otro módulo
- ❌ No debe existir estado global fuera de los módulos

### 4. Fuente de Verdad
| Dato | Estado propietario |
|------|-------------------|
| Usuario actual, lista de usuarios | `auth/authState.js` |
| Posts, filtros, comentarios | `post/postState.js` |
| Chats, mensajes, typing | `chat/chatState.js` |

## Configuración Firebase
Ver `docs/FIREBASE.md`

## Inicio rápido
Ver `docs/QUICKSTART.md`
