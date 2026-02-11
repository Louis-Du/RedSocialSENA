GUÍA DE DEMOSTRACIÓN VISUAL - FASE 2
====================================

PREPARACIÓN (5 minutos antes de presentar)
-------------------------------------------

1. Limpiar localStorage de sesiones previas (si aplica):
   - F12 → Application → Local Storage → Eliminar "currentUser"
   - O cerrar pestaña y abrir nueva (new session)

2. Abrir index.html:
   - Opción A: Arrastrar el archivo al navegador
   - Opción B: Doble click en index.html (si el SO abre en navegador)
   - Opción C: Servidor local: python -m http.server 8000 + localhost:8000

3. Verificar pantalla inicial:
   - Título: "Acceso de Demostración" ✓
   - Subtítulo: "Credenciales simuladas para fines académicos" ✓
   - Logo SENA en verde ✓
   - Campos de login listos ✓
   - Botón "Ingresar" DESHABILITADO (gris) ✓

---

DEMOSTRACIÓN - ESCENA 1: LOGIN EXITOSO (2 minutos)
--------------------------------------------------

NARRATIVA: "Voy a mostrar el flujo de autenticación con usuarios simulados"

1. Click en dropdown "Tipo de Documento"
   → Muestra opciones: CC, TI, CE
   → Seleccionar: CC

2. En campo "Número de Documento"
   → Escribir: 1234567890
   → Punto clave: Botón sigue deshabilitado (falta contraseña)

3. En campo "Contraseña"
   → Escribir: sena123
   → Punto clave: AHORA el botón se HABILITA (verde)
   → Hablar: "El botón solo se habilita cuando todos los campos están llenos"

4. Click en "Ingresar"
   → Punto clave: Botón cambia texto a "Validando..."
   → Se deshabilita
   → Hablar: "Está validando las credenciales contra la base de datos simulada"

5. Esperar ~1.5 segundos
   → Punto clave: Aparece mensaje VERDE en la parte superior
   → Mensaje: "¡Bienvenido a la red social SENA!"
   → Hablar: "Validación exitosa, mostramos feedback visual"

6. Mensaje desaparece (auto-cierre después de 3s)
   → Punto clave: Pantalla cambia a la app principal
   → Hablar: "El usuario ahora está autenticado y puede acceder a la red social"

PUNTOS DE ÉNFASIS:
✓ Validación en tiempo real (botón deshabilitado)
✓ Feedback visual claro (botón "Validando")
✓ Mensaje de confirmación visual
✓ Transición automática después de éxito

---

DEMOSTRACIÓN - ESCENA 2: LOGOUT Y CREDENCIALES INVÁLIDAS (2 minutos)
-------------------------------------------------------------------

NARRATIVA: "Voy a mostrar logout limpio y validación de error"

PARTE A: Logout
1. En la app, hacer scroll hasta encontrar botón "Cerrar sesión"
   → Ubica en header superior derecho
   → Click en botón

2. Aparece diálogo de confirmación
   → Punto clave: "¿Estás seguro que deseas cerrar sesión?"
   → Dos botones: "Cancelar" y "Confirmar"
   → Hablar: "El sistema pide confirmación para evitar logout accidental"

3. Click en "Confirmar"
   → Punto clave: Aparece mensaje verde "Sesión cerrada correctamente"
   → Se deshabilita (puede ser invisible)
   → Espera ~1 segundo
   → Punto clave: Vuelve a pantalla de login
   → Hablar: "Se limpió toda la sesión y volvió al login"

4. Verificar: Formulario está limpio (campos vacíos)
   → Punto clave: Botón está DESHABILITADO nuevamente
   → Hablar: "El formulario está limpio y listo para otro usuario"

PARTE B: Credenciales Inválidas
1. Intentar login con datos incorrectos:
   - Tipo Doc: CC
   - Número: 9999999999 (no existe en MockUsers)
   - Contraseña: sena123

2. Click en "Ingresar"
   → Botón muestra "Validando..."

3. Esperar ~1 segundo
   → Punto clave: Aparece mensaje ROJO en la parte superior
   → Mensaje: "Credenciales inválidas"
   → Hablar: "El sistema valida contra datos reales simulados"

4. Mensaje rojo desaparece (auto-cierre)
   → Punto clave: Botón se re-habilita
   → Hablar: "El usuario puede intentar de nuevo"

PUNTOS DE ÉNFASIS:
✓ Logout requiere confirmación
✓ Mensaje de confirmación de logout
✓ Limpieza completa de formulario
✓ Validación contra datos simulados
✓ Mensajes de error claros en rojo

---

DEMOSTRACIÓN EXTRA: Diferentes usuarios (1 minuto)
--------------------------------------------------

NARRATIVA: "El sistema tiene 4 usuarios simulados diferentes"

Tabla de usuarios (mostrar si tienen impreso):

| Tipo | Número | Contraseña | Nombre |
|------|--------|-----------|--------|
| CC | 1234567890 | sena123 | Daniel Rodríguez |
| CC | 1098765432 | sena123 | María García |
| TI | 98765432 | sena123 | Carlos López |
| CE | 123456 | sena123 | Ana Martínez |

DEMO: Login con segundo usuario
1. Estar en pantalla de login
2. Seleccionar: CC
3. Escribir: 1098765432 (María García)
4. Escribir: sena123
5. Click en "Ingresar"
6. Esperar mensaje de éxito
7. Cambiar a app
8. Punto clave: Ahora está como "María García"
9. Hablar: "Cada usuario simulado tiene su propio perfil y datos"

PUNTOS DE ÉNFASIS:
✓ Sistema tiene datos de demostración consistentes
✓ Cada usuario es distinto
✓ Estructura de datos es realista

---

DEMOSTRACIÓN TÉCNICA (Para desarrolladores):
---------------------------------------------

ABRIR DEVTOOLS: F12 → Console

MOSTRAR:

1. Importación de módulos:
   - En Application → Storage → Local Storage
   - Después de login, existe "currentUser" con JSON
   - Mostrar estructura: { id, tipoDocumento, numeroDocumento, nombre, ... }

2. Flujo de mensajes:
   - En Console, ver logs de:
   - "Por favor completa todos los campos"
   - "Credenciales inválidas"
   - "¡Bienvenido a la red social SENA!"
   - Hablar: "Todos los mensajes van a través de MessageManager"

3. Estructura de componentes:
   - En Network → Ver NO hay peticiones HTTP
   - Hablar: "Todo funciona sin backend, validando localmente"
   - En Console → Escribir: localStorage.getItem('currentUser')
   - Mostrar JSON del usuario actual
   - Hablar: "Datos persistentes en localStorage para esta sesión"

---

RESPUESTAS A PREGUNTAS ESPERADAS
-----------------------------------

P: "¿Dónde están las credenciales almacenadas?"
R: "En js/data/MockUsers.js, un archivo con datos de demostración.
   Son para propósitos académicos, NO en producción."

P: "¿Qué pasa si cambio la contraseña?"
R: "El sistema valida exactamente contra los datos de MockUsers.
   Para cambiar, necesitarías editar el archivo (para demo) o
   tener un backend que almacene contraseñas encriptadas."

P: "¿Por qué no usa Firebase/Backend real?"
R: "Este es un prototipo enfocado en UI/UX, sin dependencias externas.
   Facilita testing en cualquier navegador sin configuración.
   El código está diseñado para migrar a backend real sin cambios
   en la UI (solo cambiar import de MockUsers por fetch a API)."

P: "¿Por qué el formulario de login tiene indicador de sesión?"
R: "Cuando un usuario está logueado, se muestra 'Sesión activa: Daniel'
   en el formulario para confirmar visualmente quién es el usuario actual.
   Si hace logout, desaparece."

P: "¿Las validaciones son seguras?"
R: "La validación está en el cliente (DEMO). En producción:
   - Las credenciales irían a servidor HTTPS
   - Se validarían contra DB encriptada
   - Se usaría JWT o sesiones seguras
   - Sin CORS desde origen desconocido"

---

CRONÓMETRO RECOMENDADO
-----------------------

Escena 1 (Login):        2:00 minutos
Escena 2 (Logout/Error): 2:00 minutos
Escena 3 (Otros users):  1:00 minuto
Q&A Técnico:             2:00 minutos
─────────────────────────────────
TOTAL:                   7:00 minutos

(Flexible según audiencia)

---

COSAS A EVITAR EN LA DEMO
--------------------------

❌ NO ir a AppState.js (muy complejo)
❌ NO hablar de detalles técnicos si la audiencia no técnica
❌ NO intentar editar código durante la demo
❌ NO mostrar Network tab si no hay peticiones (confunde)
❌ NO entrar a modales de formulario complejos
❌ NO intentar mostrar chat/feed si falla algo

---

COSAS DESTACABLES PARA ENFATIZAR
---------------------------------

✅ Validación EN TIEMPO REAL (botón habilitado/deshabilitado)
✅ Mensajes VISUALES en lugar de alert()
✅ Confirmación CLARA antes de logout
✅ FEEDBACK INMEDIATO en validación
✅ Estructura de datos CONSISTENTE
✅ NO requiere BACKEND ni configuración externa
✅ COMPLETAMENTE funcional en navegador

---

SI ALGO FALLA EN LA DEMO
--------------------------

1. Refrescar página (F5)
   - Limpia cualquier estado corrupto
   - LocalStorage persiste

2. Limpiar localStorage
   - F12 → Application → Storage → Local Storage
   - Click derecho → Clear All
   - Refrescar página

3. Abrir en navegador diferente
   - Chrome, Firefox, Safari
   - Verifica si es problema del navegador

4. Verificar console de errores
   - F12 → Console
   - ¿Hay algún error rojo?
   - ¿Es error de importación o lógica?

5. Plan B: Mostrar código en lugar de interfaz
   - "Así se vería si tuviéramos más tiempo"
   - Mostrar MockUsers.js y explicar validación

---

DOCUMENTACIÓN PARA COMPARTIR POST-DEMO
---------------------------------------

Archivos útiles para dejar a la audiencia:

1. prototipo/README.md
   - Credenciales
   - Cómo ejecutar
   - Estructura del proyecto

2. MEJORAS_UIUX_FASE2.md
   - Qué se cambió
   - Cómo funciona

3. VALIDATION_CHECKLIST_FASE2.md
   - Cómo validar el sistema
   - Checklist técnico

---

GUÍA DE DEMOSTRACIÓN VISUAL
Versión: 1.0
Fecha: 2024
Tiempo total: 7 minutos
Dificultad: Fácil (sin prerequisitos técnicos)
Público: Mixto (técnico y no técnico)

¡LISTO PARA DEMOSTRAR! 🚀
