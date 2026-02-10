# Guía de Microcopia - Red Social SENA

## Objetivo
Mantener un vocabulario consistente, académico y profesional en toda la aplicación.

## Términos Estándar

### Publicaciones
- ✅ **Publicación** (no "post")
- ✅ **Crear publicación** (no "nuevo post")
- ✅ **Compartir publicación**
- ✅ **Eliminar publicación**

### Comentarios
- ✅ **Comentario** (consistente)
- ✅ **Agregar comentario** (no "comentar")
- ✅ **Responder al comentario**

### Conversaciones
- ✅ **Conversación** (no "chat")
- ✅ **Mensajes** (dentro de conversaciones)
- ✅ **Iniciar conversación**
- ✅ **Enviar mensaje**

### Perfil
- ✅ **Perfil de usuario** (no "perfil de aprendiz")
- ✅ **Editar perfil**
- ✅ **Ver perfil**
- ✅ **Información de perfil**

### Acciones
- ✅ **Guardar** (no "salvar")
- ✅ **Cancelar** (consistente)
- ✅ **Confirmar** (no "aceptar" en diálogos críticos)
- ✅ **Cerrar sesión** (no "salir" o "logout")

### Estados
- ✅ **Cargando...** (con puntos suspensivos)
- ✅ **Procesando...** (para operaciones)
- ✅ **Guardando...** (específico)
- ✅ **Enviando...** (para mensajes)

### Mensajes de Error
- ✅ **"No fue posible [acción]. Intenta de nuevo."** (formato estándar)
- ✅ **"Este campo es obligatorio"** (validación)
- ✅ **"Ocurrió un error al [acción]"** (genérico)

### Mensajes de Éxito
- ✅ **"[Acción] exitosa"** o **"[Elemento] creado/guardado exitosamente"**
- ✅ **"Acceso confirmado. Bienvenido(a) a la Red Social SENA."** (login)

### Estados Vacíos
- ✅ **"Aún no hay [elemento] para mostrar"** (general)
- ✅ **"No se encontraron resultados"** (búsqueda)
- ✅ **"Tu lista de [elemento] está vacía"** (personal)

## Tono y Voz

### Características
- **Profesional**: Lenguaje apropiado para entorno académico
- **Claro**: Mensajes directos y sin ambigüedad
- **Amigable**: Tono cercano sin ser informal
- **Respetuoso**: Uso apropiado de cortesía

### Ejemplos de Tono

#### ✅ Correcto
- "Por favor completa todos los campos para continuar."
- "Tu publicación se ha compartido con la comunidad."
- "Estamos procesando tu solicitud..."

#### ❌ Evitar
- "Hey! Llena todos los campos" (muy informal)
- "Tu post fue posteado" (anglicismos innecesarios)
- "Esperando..." (incompleto, poco claro)

## Formato de Textos

### Botones
- **Verbos de acción en infinitivo**: "Crear", "Guardar", "Enviar", "Cancelar"
- **Primera letra mayúscula**
- **Sin puntos al final**

### Títulos
- **Primera letra mayúscula en cada palabra importante**
- Ejemplo: "Editar Información de Perfil"

### Mensajes
- **Primera letra mayúscula, punto final**
- Ejemplo: "La publicación se ha guardado correctamente."

### Placeholders
- **Descripción clara de lo esperado**
- Ejemplo: "Escribe el contenido de tu publicación..."

## Aplicación por Componente

### Login
- Título: "Acceso de Demostración"
- Botón: "Ingresar"
- Error: "Credenciales inválidas. Verifica tus datos."
- Éxito: "Acceso confirmado. Bienvenido(a) a la Red Social SENA."

### Feed
- Título sección: "Publicaciones"
- Botón crear: "Nueva Publicación"
- Estado vacío: "Aún no hay publicaciones para mostrar"
- Placeholder: "¿Qué quieres compartir con la comunidad?"

### Comentarios
- Acción: "Agregar Comentario"
- Placeholder: "Escribe tu comentario..."
- Estado vacío: "No hay comentarios aún. ¡Sé el primero en comentar!"

### Chat/Conversaciones
- Título: "Conversaciones"
- Estado vacío: "No tienes conversaciones activas"
- Placeholder: "Escribe un mensaje..."
- Botón: "Enviar Mensaje"

### Perfil
- Título edición: "Editar Perfil"
- Botones: "Guardar Cambios", "Cancelar"
- Éxito: "Los cambios en tu perfil se guardaron correctamente."

## Validaciones y Errores Específicos

### Documento
- "El documento debe tener entre 6 y 12 dígitos"

### Contraseña
- "La contraseña debe tener al menos 6 caracteres"

### Contenido de Publicación
- "El contenido es obligatorio"
- "El contenido no puede exceder los 500 caracteres"

### Campos Requeridos
- "Este campo es obligatorio"

### Formato de Email
- "Correo electrónico no válido"

## Notas de Implementación

1. **Consistencia**: Usar siempre los mismos términos para las mismas acciones
2. **Claridad**: Preferir mensajes específicos sobre genéricos
3. **Contexto**: Adaptar el mensaje al contexto del usuario
4. **Acción**: Sugerir qué hacer cuando hay error
5. **Cortesía**: Mantener respeto sin ser excesivo
