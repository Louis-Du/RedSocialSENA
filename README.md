# Red Social para Aprendices del SENA

[![Pages](https://img.shields.io/badge/Pages-live-brightgreen)](https://louis-du.github.io/RedSocialSENA/) [![Deploy](https://github.com/Louis-Du/RedSocialSENA/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/Louis-Du/RedSocialSENA/actions/workflows/deploy-gh-pages.yml) [![License](https://img.shields.io/badge/License-RELLENAR-lightgrey)]

Una plataforma web diseñada para que aprendices y egresados del SENA compartan conocimientos, resuelvan dudas y coordinen proyectos de forma rápida, segura y pensada para móviles y escritorios.

Sitio público (prototipo): https://louis-du.github.io/RedSocialSENA/

---

## Índice de Contenido

- [Características](#características-principales)
- [Estructura](#-estructura-del-proyecto)
- [Inicio Rápido](#-inicio-rápido)
- [Documentación](#-documentación)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)

---

## Descripción

Red Social para Aprendices del SENA es una aplicación dirigida a la comunidad SENA (aprendices, egresados, instructores). Permite publicar dudas y experiencias, comentar, compartir archivos, comunicarse por chat y consultar noticias oficiales. El objetivo es mejorar la comunicación académica y profesional, facilitar la resolución de dudas y promover la colaboración en proyectos.

---

## 🏗️ Estructura del Proyecto

```
/
├── src/                    # 🔵 Código fuente de la aplicación
│   ├── core/              # bootstrap.js, main.js - inicialización
│   ├── services/          # Servicios (auth, posts, chat) + repositorios
│   ├── state/             # Estado global (Redux-like)
│   ├── ui/                # Componentes y managers de interfaz
│   ├── utils/             # Utilidades y helpers
│   ├── assets/            # CSS, imágenes, iconos
│   └── index.html         # Punto de entrada
│
├── docs/                  # 📖 Documentación completa
│   ├── guides/            # Guías de inicio rápido
│   ├── examples/          # Ejemplos de código
│   ├── tools/             # Herramientas de debugging
│   ├── firebase/          # Documentación Firebase
│   └── troubleshooting/   # Solución de problemas
│
├── firebase/              # 🔐 Configuración y reglas Firebase
├── scripts/               # 🛠️  Scripts de desarrollo y deployment
└── package.json           # Dependencias del proyecto
```

---

## 🚀 Inicio Rápido

### 1. Clonar y entrar al proyecto

```bash
git clone https://github.com/Louis-Du/RedSocialSENA.git
cd RedSocialSENA
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar servidor

**Local (solo tu PC):**
```bash
python3 -m http.server 8080 --bind 127.0.0.1 --directory src
```

**Red (múltiples dispositivos en WiFi):**
```bash
python3 -m http.server 8080 --bind 0.0.0.0 --directory src
```

### 4. Abrir en navegador

```
http://localhost:8080/index.html
```

---

## 📚 Documentación

- **[⚡ Inicio en 5 minutos](./docs/guides/INICIO_RAPIDO.md)** - Guía rápida
- **[📘 Guía completa](./docs/guides/GUIA_EJECUCION_FIREBASE.md)** - Todo sobre Firebase, testing, deployment
- **[🗺️ Índice](./docs/guides/INDICE_DOCUMENTACION.md)** - Navega toda la documentación
- **[🧪 Plan de pruebas](./docs/guides/PLAN_PRUEBAS_FIREBASE.md)** - Validación
- **[🔧 Troubleshooting](./docs/troubleshooting/COMANDOS_Y_TROUBLESHOOTING.md)** - Errores comunes

---

## ✨ Características Principales

- 📝 **Publicaciones** - Crea y comparte posts
- 💬 **Chat en tiempo real** - Mensajería privada y grupal
- ❤️ **Likes y comentarios** - Interactúa con contenido
- 👤 **Perfiles personalizables** - Información personal y académica
- 📰 **Noticias** - Acceso a noticias del SENA
- 📱 **Responsive** - Optimizado para móvil
- 🔐 **Autenticación segura** - Login con documento

---

## 🏛️ Arquitectura

**Capas:**
```
UI (Managers, Renderers)
    ↓
Services (Lógica de negocio)
    ↓
Repository (Source selector: local/Firebase)
    ↓
State (Redux-like)
    ↓
Data Sources (LocalStorage / Firebase)
```

---

## 📦 Tecnologías

- **Frontend**: Vanilla JavaScript (ES Modules)
- **Estilos**: Tailwind CSS 3.4+
- **Backend Opcional**: Firebase (Auth, Firestore, Storage)
- **Iconos**: Lucide Icons
- **Compatibilidad**: LocalStorage (fallback sin Firebase)

---

## 🤝 Autores y Contacto

Equipo:
- Luis Alberto Dueñas Franco  
- Lukas Alejandro Díaz C.  
- Javier Medrano Hernández  
- Jhon Freyman Torrez  
- Yani Luna Vigoya

Repositorio: https://github.com/Louis-Du/RedSocialSENA  
Contacto: https://github.com/Louis-Du

---

## Licencia