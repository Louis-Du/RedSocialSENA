# Guía de Prueba - Corrección de Identidad

## Servidor de Prueba

El servidor web está corriendo en:
**http://localhost:8080/index.html**

## Checklist de Validación

### 1. Estado Inicial (Feed Vacío)

- [ ] Abrir http://localhost:8080/index.html
- [ ] Hacer login con credenciales de prueba (ej: CC 1234567890)
- [ ] **Verificar**: Feed muestra estado vacío con mensaje "No hay publicaciones registradas"
- [ ] **Verificar**: Sección de chats muestra "No hay conversaciones activas"

### 2. Crear Publicación como Usuario Autenticado

- [ ] Navegar a "Crear Publicación"
- [ ] Escribir contenido: "Mi primera publicación de prueba"
- [ ] Hacer clic en "Publicar"
- [ ] **Verificar**: Publicación aparece en el feed
- [ ] **Verificar**: Autor muestra nombre correcto (Daniel Esteban)

### 3. Navegación al Perfil del Autor (Perfil Propio)

- [ ] Hacer clic en el **nombre del autor** de la publicación recién creada
- [ ] **Verificar**: URL cambia a `#profile` (sin query params porque es perfil propio)
- [ ] **Verificar**: Se muestra el perfil con los datos correctos:
  - Nombre: Daniel Esteban
  - Programa: Tecnólogo en Análisis y Desarrollo de Software
  - Trimestre: 3° Trimestre
- [ ] **Verificar**: Los campos del formulario son editables
- [ ] **Verificar**: Los botones "Guardar" están visibles
- [ ] **Verificar**: La sección "Seguridad y Contraseña" está visible

### 4. Navegación Directa a Perfil de Otro Usuario

- [ ] En la barra de direcciones, agregar: `#profile?userId=user_2`
- [ ] Presionar Enter
- [ ] **Verificar**: Se muestra el perfil de María García:
  - Nombre: María García
  - Programa: Técnica en Administración de Sistemas
  - Trimestre: 2° Trimestre
- [ ] **Verificar**: Los campos del formulario son readonly (no editables)
- [ ] **Verificar**: Los botones "Guardar" NO están visibles
- [ ] **Verificar**: La sección "Seguridad y Contraseña" NO está visible
- [ ] **Verificar**: Título del perfil puede mostrar "Perfil de María García"

### 5. Navegación entre Perfiles

- [ ] Cambiar URL a `#profile?userId=user_3` (Carlos López)
- [ ] **Verificar**: Se carga el perfil de Carlos López
- [ ] Cambiar URL a `#profile?userId=user_4` (Ana Martínez)
- [ ] **Verificar**: Se carga el perfil de Ana Martínez
- [ ] Cambiar URL a `#profile` (sin params)
- [ ] **Verificar**: Se carga el perfil propio (Daniel Esteban) con campos editables

### 6. Crear Múltiples Publicaciones y Verificar Identidad

- [ ] Volver al feed (`#app`)
- [ ] Crear segunda publicación: "Otra publicación de prueba"
- [ ] **Verificar**: Ambas publicaciones muestran el mismo autor (Daniel Esteban)
- [ ] Hacer clic en el nombre del autor en la primera publicación
- [ ] **Verificar**: Navega a `#profile` (perfil propio)
- [ ] Volver al feed
- [ ] Hacer clic en el nombre del autor en la segunda publicación
- [ ] **Verificar**: Navega a `#profile` (perfil propio)

### 7. Validación de authorId en Posts

- [ ] Abrir la consola del navegador (F12)
- [ ] En la consola, escribir:
  ```javascript
  appState.getPosts().forEach(p => console.log(`Post ${p.id}: userId=${p.userId}`))
  ```
- [ ] **Verificar**: Todos los posts tienen `userId: 'user_1'` (Daniel Esteban)

### 8. Validación de Navegación con Hash

- [ ] Probar navegación manual:
  - `#app` → Feed
  - `#profile` → Perfil propio
  - `#profile?userId=user_2` → Perfil de María
  - `#profile?userId=user_3` → Perfil de Carlos
  - `#chat` → Chats
- [ ] **Verificar**: Todas las navegaciones funcionan correctamente
- [ ] **Verificar**: Refrescar la página (F5) mantiene la vista actual

### 9. Persistencia de Vista

- [ ] Navegar a `#profile?userId=user_2`
- [ ] Refrescar la página (F5)
- [ ] **Verificar**: Sigue mostrando el perfil de María García
- [ ] Navegar a `#profile`
- [ ] Refrescar la página (F5)
- [ ] **Verificar**: Sigue mostrando el perfil propio

### 10. Estados Vacíos

- [ ] Navegar a `#chat`
- [ ] **Verificar**: Muestra "No hay conversaciones activas. Inicia un mensaje para comenzar."
- [ ] Limpiar el feed:
  ```javascript
  // En consola del navegador
  localStorage.removeItem('RedSocialSena_posts')
  location.reload()
  ```
- [ ] **Verificar**: Feed muestra estado vacío con icono y mensaje

## Resultados Esperados

✅ **Identidad Consistente**:
- Cada usuario tiene identidad clara y única
- El perfil mostrado siempre corresponde al usuario correcto

✅ **Navegación Coherente**:
- Hacer clic en autor navega al perfil correcto
- URLs con query params funcionan correctamente
- La navegación persiste al refrescar

✅ **Datos Congruentes**:
- Posts siempre tienen authorId (userId)
- Feed y chats inician vacíos
- Solo se crean datos cuando el usuario lo hace

✅ **Permisos Correctos**:
- Solo se puede editar el perfil propio
- Perfiles de otros son readonly
- Controles de edición se muestran/ocultan según contexto

## Problemas Potenciales

Si encuentras alguno de estos problemas, reportar:

1. **Error en consola**: Verificar que todos los imports estén correctos
2. **Perfil incorrecto**: Verificar que userId en post coincide con autor
3. **Navegación no funciona**: Verificar que NavigationManager está inicializado
4. **Campos no readonly**: Verificar que ProfileManager detecta isOwnProfile correctamente

## Contacto de Prueba

Una vez completada la validación:
- ✅ Confirmar que todo funciona
- 🐛 Reportar problemas específicos encontrados
- 📝 Sugerir mejoras adicionales

---

**Servidor**: http://localhost:8080/index.html
**Documentación**: docs/FASE4_EXTENSION_IDENTIDAD.md
