# Prototipo - Red Social para Aprendices del SENA

## Propósito

Esta carpeta contiene el **prototipo visual funcional** de la Red Social para Aprendices del SENA. Se trata de una demostración interactiva desarrollada con HTML, CSS y JavaScript que simula la interfaz de usuario y las principales funcionalidades del sistema, permitando validar el diseño, la navegación y la experiencia de usuario antes de la implementación del backend completo.

## Características principales del prototipo

### 🎨 Interfaz de Usuario
- ✅ **Diseño responsive** adaptable a móviles, tablets y escritorio
- ✅ **Tema institucional** con colores y branding del SENA
- ✅ **Navegación intuitiva** con menú lateral y barra de navegación inferior (dock) para móviles
- ✅ **Iconografía moderna** utilizando Lucide Icons
- ✅ **Animaciones y transiciones** suaves para mejorar la experiencia

### 📱 Funcionalidades Simuladas
- **Autenticación**: Pantalla de login con validación visual
- **Feed de publicaciones**: Visualización de posts con texto e imágenes
- **Sistema de comentarios**: Comentarios en hilo con respuestas
- **Reacciones**: Likes y otras reacciones a publicaciones
- **Carga de archivos**: Interfaz para subir imágenes y documentos con vista previa
- **Chat privado y grupal**: Interfaz de mensajería instantánea
- **Panel de noticias oficiales**: Sección con noticias del SENA (soporte para WebP)
- **Perfiles de usuario**: Vista de perfil con información y publicaciones
- **Sistema de verificación**: Badges de verificación para usuarios oficiales
- **Filtros avanzados**: Por centro de formación, etapa lectiva y trimestre

### 🎯 Páginas/Vistas Disponibles
1. **Login/Registro** - Autenticación de usuarios
2. **Home/Feed** - Publicaciones de la comunidad
3. **Noticias** - Información oficial del SENA
4. **Perfil** - Vista del perfil de usuario (propio y otros)
5. **Editar Perfil** - Formulario de actualización de datos
6. **Chat** - Mensajería instantánea
7. **Notificaciones** - Centro de notificaciones

---

## Estructura de la carpeta

```
prototipo/
├── README.md                    # Este archivo
├── index.html                   # Página principal (contiene todas las vistas)
├── assets/                      # Recursos estáticos
│   ├── css/                     # Estilos personalizados
│   │   └── styles.css          # CSS adicional y ajustes
│   ├── js/                      # JavaScript
│   │   └── lucide.min.js       # Librería de iconos Lucide
│   ├── noticias/                # Imágenes para noticias
│   │   ├── noticia1.png        
│   │   ├── noticia1.webp       # Versión optimizada WebP
│   │   ├── noticia2.png
│   │   └── noticia2.webp
│   ├── logo-sena-blanco.png    # Logo SENA sobre fondo oscuro
│   ├── logo-sena-verde.png     # Logo SENA versión verde
│   └── firma-digital-sena.png  # Firma institucional
└── scripts/                     # Scripts de utilidad
    └── convert_images.py       # Script Python para conversión de imágenes a WebP
```

---

## Tecnologías utilizadas

### Frontend Framework & Libraries
- **HTML5**: Estructura semántica del contenido
- **CSS3**: Estilos personalizados y animaciones
- **Tailwind CSS** (CDN): Framework de utilidades CSS para diseño responsive rápido
- **JavaScript Vanilla**: Lógica de interacción y navegación entre vistas
- **Lucide Icons**: Conjunto de iconos modernos y minimalistas

### Optimizaciones
- **Imágenes WebP**: Formato de imagen optimizado para web con mejor compresión
- **Lazy Loading**: Carga diferida de recursos (implementable)
- **Mobile-First Design**: Diseño pensado primero para dispositivos móviles

---

## Credenciales de Demostración

Este es un **prototipo académico** con autenticación simulada. No requiere backend. Usa las siguientes credenciales para probar:

| Tipo Doc | Número | Contraseña | Nombre |
|----------|--------|-----------|--------|
| **CC** | 1234567890 | sena123 | Daniel Rodríguez |
| **CC** | 1098765432 | sena123 | María García |
| **TI** | 98765432 | sena123 | Carlos López |
| **CE** | 123456 | sena123 | Ana Martínez |

**Todas las contraseñas son `sena123`**

> ⚠️ **Nota de Seguridad**: Este es un prototipo educativo. Las credenciales se encuentran en `js/data/MockUsers.js` y no están encriptadas. **NO usar en producción**.

---

## Cómo ver el prototipo localmente

### Opción 1: Abrir directamente en el navegador

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Louis-Du/RedSocialSENA.git
   ```

2. Navega a la carpeta del prototipo:
   ```bash
   cd RedSocialSENA/prototipo
   ```

3. Abre `index.html` con tu navegador preferido

### Opción 2: Servidor HTTP local (Recomendado)

Para evitar problemas con CORS:

**Usando Python:**
```bash
cd prototipo
python -m http.server 8000
```
Luego visita: `http://localhost:8000`

### Prueba rápida (2 minutos)

1. **Abrir la app** → Verás la pantalla de "Acceso de demostración"
2. **Login** → Usa: Tipo Doc = `CC`, Número = `1234567890`, Contraseña = `sena123`
3. **Explorar** → Verás el feed con publicaciones de demostración
4. **Chat** → Chatea con otros usuarios (María, Carlos, Ana)
5. **Logout** → Botón en la esquina superior derecha

---

## Despliegue (GitHub Pages)

El prototipo está disponible públicamente en:
**🌐 https://louis-du.github.io/RedSocialSENA/**

El proyecto utiliza GitHub Actions para desplegar automáticamente en GitHub Pages.

Si necesitas reconfigurar o forzar un redespliegue:
- Asegúrate de que en Settings → Actions → Workflow permissions esté habilitada la opción "Read and write permissions" si usas `GITHUB_TOKEN`.
- Si usas un token personal (PAT) añade el secret `GH_PAGES_TOKEN` con permisos `repo` o un fine‑grained token con Contents: Write.
- Para forzar redeploy: hacer cualquier cambio en `main` (p. ej. actualizar README) y push — el workflow se ejecutará automáticamente.

>[Notas]
>- El workflow crea `public/.nojekyll` para evitar procesamiento Jekyll.
>- Si la rama `gh-pages` está protegida, permite al bot/token empujar o usa un PAT con permisos adecuados.
