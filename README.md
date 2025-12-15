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

## Estructura sugerida del repositorio

```
RedSocialSENA/
├── README.md                           # Este archivo
├── documents/                          # Documentación del proyecto
│   ├── academico/                      # Documentos académicos
│   │   ├── PosterTecnova2025.pdf
│   │   └── Proyecto Red Social para Aprendices del SENA (justificación).pdf
│   ├── requisitos/                     # Requisitos y especificaciones
│   │   └── historias_usuario_sena_mejorada.docx
│   ├── sqa/                            # Aseguramiento de calidad del software
│   │   ├── Evaluación del comportamiento... - Listas de chequeo correccion.pdf
│   │   ├── Informe sobre la lista de chequeo y evaluación.pdf
│   │   ├── Plan de SQA.pdf
│   │   └── README.md
│   └── pruebas/                        # Documentación de pruebas
│       └── README.md
└── prototipo/                          # Prototipo visual del proyecto
    ├── README.md
    ├── index.html                      # Página principal del prototipo
    ├── assets/                         # Recursos estáticos
    │   ├── css/                        # Estilos CSS
    │   │   └── styles.css
    │   ├── js/                         # Scripts JavaScript
    │   │   └── lucide.min.js
    │   ├── noticias/                   # Imágenes de noticias
    │   │   ├── noticia1.png
    │   │   ├── noticia1.webp
    │   │   ├── noticia2.png
    │   │   └── noticia2.webp
    │   ├── logo-sena-blanco.png
    │   ├── logo-sena-verde.png
    │   └── firma-digital-sena.png
    └── scripts/                        # Scripts de utilidad
        └── convert_images.py
```

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
- Jhon Freyman Torrez  
- Yani Luna Vigoya

Repositorio: https://github.com/Louis-Du/RedSocialSENA  
Contacto: https://github.com/Louis-Du

---

## Licencia

