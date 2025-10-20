
## Características principales del prototipo

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