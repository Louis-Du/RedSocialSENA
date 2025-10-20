# Red Social para Aprendices del SENA

[![Pages](https://img.shields.io/badge/Pages-live-brightgreen)](https://louis-du.github.io/RedSocialSENA/) [![Deploy](https://github.com/Louis-Du/RedSocialSENA/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/Louis-Du/RedSocialSENA/actions/workflows/deploy-gh-pages.yml) [![License](https://img.shields.io/badge/License-RELLENAR-lightgrey)]

Una plataforma web diseñada para que aprendices y egresados del SENA compartan conocimientos, resuelvan dudas y coordinen proyectos de forma rápida, segura y pensada para móviles y escritorios.

Sitio público (prototipo): https://louis-du.github.io/RedSocialSENA/

---

## Índice

- [Descripción](#descripción)  
- [Prototipo (diseño y mockups)](#prototipo-diseño-y-mockups)  
- [Características principales](#características-principales)  
- [Cómo ver el prototipo localmente](#cómo-ver-el-prototipo-localmente)  
- [Despliegue (GitHub Pages)](#despliegue-github-pages)  
- [Contribuir](#contribuir)  
- [Estructura sugerida del repositorio](#estructura-sugerida-del-repositorio)  
- [Autores y contacto](#autores-y-contacto)  
- [Licencia](#licencia)

---

## Descripción

Red Social para Aprendices del SENA es una aplicación dirigida a la comunidad SENA (aprendices, egresados, instructores). Permite publicar dudas y experiencias, comentar, compartir archivos, comunicarse por chat y consultar noticias oficiales. El objetivo es mejorar la comunicación académica y profesional, facilitar la resolución de dudas y promover la colaboración en proyectos.

---

## Prototipo (diseño y mockups)

El repositorio incluye un prototipo visual estático (HTML + CSS + JS) con pantallas de login, feed, noticias, perfil, edición y chat.

- Carpeta del prototipo: https://github.com/Louis-Du/RedSocialSENA/tree/main/prototipo  
- Archivo principal del prototipo: https://github.com/Louis-Du/RedSocialSENA/blob/main/prototipo/index.html

Contenido clave:
- Diseño responsive con Tailwind.
- Recursos en `prototipo/assets/`.
- Script para convertir imágenes: `prototipo/scripts/convert_images.py`.

---

## Características principales

- Publicaciones con texto e imágenes.  
- Comentarios en hilo.  
- Carga de archivos y vista previa.  
- Chats privados y grupales.  
- Panel de noticias oficiales (soporte WebP).  
- Perfiles de usuario y verificación opcional.  
- Filtros por centro, etapa y trimestre.

---

## Cómo ver el prototipo localmente

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Louis-Du/RedSocialSENA.git
   ```
2. Abre el prototipo:
   - Navega a `RedSocialSENA/prototipo` y abre `index.html` con el navegador.
   - (Opcional) Levanta un servidor local:
     ```bash
     cd prototipo
     python -m http.server 8000
     # luego visita http://localhost:8000
     ```

---

## Despliegue (GitHub Pages)

El proyecto ya está configurado para publicar el contenido del prototipo en GitHub Pages mediante un workflow que copia `prototipo/` a la rama `gh-pages`.

- Workflow: `.github/workflows/deploy-gh-pages.yml`  
- Source Pages: rama `gh-pages`, carpeta raíz.  
- URL: https://louis-du.github.io/RedSocialSENA/

Si necesitas reconfigurar o volver a desplegar manualmente:
- Asegúrate de que en Settings → Actions → Workflow permissions esté habilitada la opción "Read and write permissions" si usas `GITHUB_TOKEN`.
- Si usas un token personal (PAT) añade el secret `GH_PAGES_TOKEN` con permisos `repo` o un fine‑grained token con Contents: Write.
- Para forzar redeploy: hacer cualquier cambio en `main` (p. ej. actualizar README) y push — el workflow se ejecutará automáticamente.

>[Notas]
>- El workflow crea `public/.nojekyll` para evitar procesamiento Jekyll.
>- Si la rama `gh-pages` está protegida, permite al bot/token empujar o usa un PAT con permisos adecuados.

---

## Contribuir

1. Haz fork del repositorio.  
2. Crea una rama descriptiva:
   ```bash
   git checkout -b feat/nombre-funcionalidad
   ```
3. Realiza cambios y agrega tests/ documentación si aplica.  
4. Abre un Pull Request indicando la motivación y los cambios realizados.

>[Sugerencias]
>- Añadir `CONTRIBUTING.md` con normas de estilo, formato de commits y proceso de PR.
>- Añadir plantillas: ISSUE_TEMPLATE y PULL_REQUEST_TEMPLATE.

---

## Autores y contacto

Equipo:
- Luis Alberto Dueñas Franco  
- Lukas Alejandro Díaz C.  
- Javier Medrano Hernández  
- Cristal Luna Argumedo Sánchez

Repositorio: https://github.com/Louis-Du/RedSocialSENA  
Contacto: https://github.com/Louis-Du

---

## Licencia


---

Notas finales
- ¿Quieres que aplique estas actualizaciones (commit directo a `main` o abrir PR)?  
- Puedo además: añadir badge Pages/Actions (ya incluidos arriba), crear `CONTRIBUTING.md`, `LICENSE`, o una `404.html` para el sitio Pages. Dime qué prefieres que haga ahora.
