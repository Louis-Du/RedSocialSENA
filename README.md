# Red Social para Aprendices del SENA

Una plataforma web diseñada para que aprendices y egresados del SENA compartan conocimientos, resuelvan dudas y coordinen proyectos de forma rápida, segura y pensada para móviles y escritorios.

---

## Tabla de contenido

- [Descripción](#descripción)
- [Prototipo (diseño y mockups)](#prototipo-diseño-y-mockups)
- [Características principales](#características-principales)
- [Beneficios para la comunidad](#beneficios-para-la-comunidad)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Cómo ver el prototipo localmente](#cómo-ver-el-prototipo-localmente)
- [Publicar prototipo (sugerencias)](#publicar-prototipo-sugerencias)
- [Estado actual y próximos pasos recomendados](#estado-actual-y-próximos-pasos-recomendados)
- [Contribuir](#contribuir)
- [Autores y contacto](#autores-y-contacto)
- [Licencia](#licencia)

---

## Descripción

Red Social para Aprendices del SENA es una aplicación pensada para la comunidad SENA (aprendices, egresados e instructores). Permite publicar dudas y experiencias, comentar, compartir archivos, chatear en privado o en grupos y mantener un panel con noticias oficiales del SENA. Está orientada a facilitar la colaboración académica y profesional dentro de los centros de formación.

Objetivo principal: reducir la fricción comunicativa entre aprendices y egresados para acelerar la resolución de dudas, la coordinación de prácticas y la difusión de oportunidades.

---

## Prototipo (diseño y mockups)

El repositorio incluye un prototipo visual estático (HTML + CSS + JS) con pantallas de login, feed, noticias, perfil, edición y chat.

- Carpeta del prototipo: prototipo/  
  https://github.com/Louis-Du/RedSocialSENA/tree/main/prototipo

- Archivo principal del prototipo (abrir en navegador):  
  https://github.com/Louis-Du/RedSocialSENA/blob/main/prototipo/index.html

Contenido clave del prototipo:
- HTML estático con diseño responsive (Tailwind).
- Imágenes optimizadas (PNG + WEBP) en `prototipo/assets/noticias/`.
- Script de utilidades para conversión de imágenes: `prototipo/scripts/convert_images.py`.

---

## Características principales

- Publicaciones públicas con texto e imágenes.
- Comentarios en publicaciones (encadenados / hilo).
- Carga y vista previa de imágenes y documentos.
- Chat privado y chats grupales con burbujas estilo móvil.
- Panel de noticias oficiales con imágenes responsive (soporte WebP).
- Perfil de usuario (foto, banner, ciudad, trimestre, formación).
- Filtros por centro, etapa y trimestre.
- Diseño pensado para accesibilidad y compatibilidad móvil.

---

## Beneficios para la comunidad

- Respuestas más rápidas y accesibles.
- Compartición de evidencia y recursos de aprendizaje.
- Canal de comunicación entre aprendices, egresados e instructores.
- Mayor visibilidad de oportunidades y proyectos.

---

## Cómo ver el prototipo localmente

1. Clona el repositorio:
   git clone https://github.com/Louis-Du/RedSocialSENA.git

2. Abre el archivo del prototipo en tu navegador:
   - Navega a `RedSocialSENA/prototipo` y abre `index.html` con doble clic o arrastrando el archivo al navegador.
   - No necesita servidor (es estático). Si prefieres, puedes usar un servidor local simple:
     - Python 3: `python -m http.server 8000` (desde la carpeta `prototipo`), luego visita `http://localhost:8000`.

3. Recursos de noticias: las imágenes WebP se generan junto a los PNG (si ejecutas `prototipo/scripts/convert_images.py` con Pillow instalado), pero el prototipo ya incluye PNG y WEBP.

---

## Autores y contacto

Equipo:
- Luis Alberto Dueñas Franco
- Lukas Alejandro Díaz C.
- Javier Medrano Hernández
- Cristal Luna Argumedo Sánchez

Repositorio: https://github.com/Louis-Du/RedSocialSENA  
Propietario / contacto: @Louis-Du
