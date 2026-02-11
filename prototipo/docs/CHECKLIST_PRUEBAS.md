# Checklist de Pruebas - Mejoras Fases 1 y 2

## Acceso
- [ ] Servidor corriendo en: http://127.0.0.1:8080
- [ ] Página de pruebas: http://127.0.0.1:8080/test_mejoras.html
- [ ] Página principal: http://127.0.0.1:8080/index.html

---

## Pruebas de Funcionalidad

### ✅ Fase 1: UX y Claridad

#### 1. Indicadores de Estado Global
**Ubicación**: MessageManager.js
- [ ] Abrir página de pruebas (test_mejoras.html)
- [ ] Click en "Mostrar Loading" → Debe aparecer banner azul con spinner en la parte superior
- [ ] Click en "Mostrar Success" → Debe aparecer banner verde con checkmark
- [ ] Click en "Mostrar Error" → Debe aparecer banner rojo con X
- [ ] Verificar que los banners se auto-cierren después de 3 segundos

**Prueba en la App Principal**:
- [ ] Abrir index.html
- [ ] Intentar login con credenciales válidas (CC 1234567890, password: sena123)
- [ ] Debe aparecer banner "Validando credenciales..."
- [ ] Luego debe cambiar a "Acceso confirmado..."

#### 2. Validación en Tiempo Real
**Ubicación**: FormValidator.js
- [ ] En test_mejoras.html, sección "Validación en Tiempo Real"
- [ ] Escribir solo 5 dígitos en "Documento" → Click fuera → Debe mostrar error "El documento debe tener entre 6 y 12 dígitos"
- [ ] Escribir 6 dígitos → Error debe desaparecer
- [ ] Escribir menos de 6 caracteres en "Contraseña" → Debe mostrar error
- [ ] El botón "Enviar" debe estar deshabilitado si hay errores

**Prueba en Login**:
- [ ] En index.html, dejar campos vacíos → Botón debe estar deshabilitado
- [ ] Seleccionar tipo de documento → Botón sigue deshabilitado
- [ ] Llenar documento → Botón sigue deshabilitado
- [ ] Llenar contraseña → Botón debe habilitarse

#### 3. Microcopia Consistente
**Ubicación**: docs/MICROCOPIA.md
- [ ] Revisar el documento en prototipo/docs/MICROCOPIA.md
- [ ] Verificar que los textos de la app usen:
  - [ ] "Publicación" (no "post")
  - [ ] "Conversación" (no "chat")
  - [ ] "Cerrar sesión" (no "logout")
  - [ ] Mensajes con formato: "No fue posible [acción]. Intenta de nuevo."

#### 4. Feedback en Botones
**Ubicación**: ButtonHelper.js
- [ ] En test_mejoras.html, sección "Botones con Feedback"
- [ ] Click en "Probar Loading"
- [ ] El botón debe mostrar:
  1. Spinner + "Procesando..." (2 segundos)
  2. Checkmark + "Completado!" (2 segundos)
  3. Volver al estado original

**Prueba en Login**:
- [ ] Intentar login → Botón debe mostrar spinner y "Validando..."
- [ ] Durante la carga, botón debe estar deshabilitado

---

### ✅ Fase 2: Coherencia Visual

#### 5. Estados Vacíos Unificados
**Ubicación**: UIComponents.js
- [ ] En test_mejoras.html, sección "Estados Vacíos"
- [ ] Click en "Estado Vacío - Posts" → Debe mostrar:
  - Icono de documento
  - Título "No hay publicaciones"
  - Mensaje descriptivo
  - Botón "Crear Publicación"
- [ ] Click en "Estado Vacío - Chat" → Debe mostrar:
  - Icono de chat
  - Título "No hay conversaciones"
  - Mensaje descriptivo
  - Botón "Iniciar Conversación"

**Prueba en App Principal**:
- [ ] Si el feed está vacío, debe mostrar estado vacío con botón de acción

#### 6. Estados de Error Visuales
**Ubicación**: UIComponents.js
- [ ] En test_mejoras.html, sección "Bloques de Error"
- [ ] Click en "Error" → Debe mostrar bloque rojo con:
  - Icono de error
  - Título "Error al cargar datos"
  - Mensaje descriptivo
  - Botón "Reintentar"
- [ ] Click en "Warning" → Bloque amarillo
- [ ] Click en "Info" → Bloque azul

#### 7. Placeholders Consistentes
**Ubicación**: UIComponents.js
- [ ] En test_mejoras.html, sección "Placeholders y Skeletons"
- [ ] Click en "Mostrar Placeholders" → Debe mostrar:
  - Avatar placeholder circular con icono
  - Post placeholder rectangular con icono
- [ ] Click en "Mostrar Skeletons" → Debe mostrar:
  - Skeleton de post con animación de pulso
  - Skeleton de comentario con animación

---

## Pruebas de Integración

### Login Completo con Todas las Mejoras
1. [ ] Abrir http://127.0.0.1:8080/index.html
2. [ ] Botón "Ingresar" debe estar deshabilitado inicialmente
3. [ ] Llenar documento con texto inválido → Debe mostrar error de validación
4. [ ] Corregir documento → Error debe desaparecer
5. [ ] Llenar contraseña válida → Botón debe habilitarse
6. [ ] Click en "Ingresar":
   - [ ] Banner global "Validando credenciales..." debe aparecer
   - [ ] Botón debe mostrar spinner + "Validando..."
   - [ ] Después de éxito, banner cambia a "Acceso confirmado..."
   - [ ] Redirección a vista de app

### Crear Publicación con Validación
1. [ ] Después de login, intentar crear publicación vacía
2. [ ] Debe mostrar validación de campo requerido
3. [ ] Llenar contenido → Validación debe desaparecer
4. [ ] Al publicar:
   - [ ] Banner global "Creando publicación..."
   - [ ] Botón con spinner "Publicando..."
   - [ ] Al éxito, banner "Publicación creada exitosamente"

---

## Verificación de Errores en Consola

### Usando DevTools del Navegador
1. [ ] Abrir DevTools (F12)
2. [ ] Ir a la pestaña "Console"
3. [ ] Verificar que NO haya errores en rojo
4. [ ] Verificar que aparezcan logs de éxito:
   - [ ] "✅ Tests cargados correctamente" (en test_mejoras.html)
   - [ ] Logs de inicialización de módulos

### Test de Carga de Módulos
1. [ ] Abrir http://127.0.0.1:8080/test-modules-mejoras.html
2. [ ] Verificar que todos los módulos muestren "✅ OK"
3. [ ] NO debe haber mensajes "❌ ERROR"

---

## URLs de Referencia

- **Página Principal**: http://127.0.0.1:8080/index.html
- **Test Interactivo**: http://127.0.0.1:8080/test_mejoras.html
- **Test de Módulos**: http://127.0.0.1:8080/test-modules-mejoras.html
- **Documentación**: 
  - prototipo/docs/MICROCOPIA.md
  - prototipo/docs/MEJORAS_IMPLEMENTADAS.md

---

## Credenciales de Prueba

- **Usuario 1**: CC 1234567890 / sena123
- **Usuario 2**: CC 9876543210 / sena123
- **Usuario 3**: CC 5555555555 / sena123
- **Usuario 4**: TI 11223344 / sena123

---

## Resultados Esperados

### ✅ Funciona Correctamente Si:
- No hay errores en consola del navegador
- La validación muestra mensajes claros bajo los campos
- Los botones muestran estados de loading con spinner
- Los banners globales aparecen y desaparecen correctamente
- Los estados vacíos son visualmente consistentes
- Los bloques de error tienen iconos y acciones sugeridas

### ❌ Hay Problemas Si:
- Errores de importación de módulos en consola
- La validación no muestra mensajes
- Los botones no cambian de estado
- Los banners no aparecen
- Los componentes UI no se renderizan

---

## Acciones si Hay Errores

1. **Error de importación de módulos**:
   - Verificar que las rutas en los imports sean correctas
   - Verificar que los archivos existan en js/utils/

2. **Validación no funciona**:
   - Verificar que FormValidator esté importado en AuthManager y PostManager
   - Verificar que los IDs de los campos coincidan

3. **Banners no aparecen**:
   - Verificar que MessageManager.showGlobalStatus() esté definido
   - Verificar que no haya conflictos de z-index

4. **Botones sin feedback**:
   - Verificar que ButtonHelper esté importado
   - Verificar que withLoading() se esté llamando correctamente

---

**Fecha de creación**: 2026-02-11  
**Estado**: Lista para pruebas
