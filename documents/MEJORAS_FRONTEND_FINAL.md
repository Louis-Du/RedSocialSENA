# Propuestas de mejora para frontend final

## Objetivo
Fortalecer el frontend como base final del sistema, priorizando UX, consistencia visual, robustez y preparacion para integracion con backend, sin agregar frameworks ni backend propio y manteniendo despliegue directo en GitHub Pages.

## 1) UX y claridad para el usuario
1. Indicadores de estado global
   - Agregar un banner discreto de estado (cargando, exito, error) reutilizando MessageManager.
   - Justificacion: reduce incertidumbre cuando hay acciones asincronas (login, crear post, cargar chats).

2. Validacion en tiempo real en formularios
   - Mensajes cortos y visibles bajo cada campo (documento, password, post, comentario).
   - Justificacion: evita errores frecuentes y mejora la tasa de completitud.

3. Microcopia consistente y academica
   - Unificar vocabulario (publicacion, comentario, conversacion, perfil) en todos los textos.
   - Justificacion: aumenta coherencia y percepcion profesional.

4. Feedback de acciones en botones
   - Cambiar texto y estado del boton (cargando, deshabilitado) durante operaciones.
   - Justificacion: evita dobles envios y mejora control del usuario.

## 2) Coherencia visual y de estados
5. Sistema de estados vacios unificado
   - Plantilla comun para feed, comentarios, chats, perfil y noticias.
   - Justificacion: experiencia consistente y sin pantallas vacias.

6. Estados de error visuales
   - Mostrar bloques de error con icono y accion sugerida (reintentar, volver).
   - Justificacion: UX mas clara que alertas genericas.

7. Uso consistente de placeholders
   - Unificar estilos y proporciones de imagen en cards y perfiles.
   - Justificacion: reduce saltos visuales y layout shift.

## 3) Preparacion para backend (Firebase / API)
8. Capa de servicios con interfaz estable
   - Documentar contratos de servicios (UserService, PostService, ChatService).
   - Justificacion: facilita migracion a API sin tocar UI.

9. Adaptadores de datos (mapeo)
   - Centralizar mapeo de datos de API a modelo interno.
   - Justificacion: evita duplicacion y errores al integrar backend real.

10. Manejo centralizado de errores
    - Normalizar errores (codigo, mensaje, accion sugerida).
    - Justificacion: se alinea con respuestas de API y mejora estabilidad.

## 4) Robustez del flujo de navegacion y uso
11. Guardas de navegacion
    - Bloquear vistas cuando no hay sesion activa.
    - Justificacion: previene estados inconsistentes y errores de UI.

12. Rutas internas simples por hash
    - Usar hash (#login, #app, #editProfile) sin framework.
    - Justificacion: facilita uso de GitHub Pages y permite refrescar sin perder vista.

13. Persistencia de vista actual
    - Guardar la ultima vista en localStorage.
    - Justificacion: mejora continuidad de uso.

## 5) Calidad y consistencia del codigo frontend
14. Convencion de nombres y carpetas
    - Documentar estandar (componentes UI, servicios, data, utils).
    - Justificacion: reduce friccion para mantenimiento.

15. Separacion clara entre UI y servicios
    - Evitar logica de negocio en UI (validaciones y reglas en servicios).
    - Justificacion: aumenta testabilidad y preparacion para backend.

16. Eventos personalizados documentados
    - Lista de eventos UI (navigationChanged, editProfileShown).
    - Justificacion: reduce acoplamiento y facilita nuevas pantallas.

## 6) Accesibilidad y usabilidad
17. Navegacion por teclado
    - Mejorar focus states y orden de tab.
    - Justificacion: cumplimiento basico de accesibilidad.

18. Texto alternativo y aria
    - Revisar alt de imagenes y botones con iconos.
    - Justificacion: accesibilidad y SEO basico.

## 7) Rendimiento y estabilidad
19. Carga diferida de modulos secundarios
    - Cargar chat o perfil cuando se necesite.
    - Justificacion: mejora tiempo de carga inicial.

20. Evitar layout shift
    - Reservar espacios para imagenes y listas.
    - Justificacion: experiencia mas estable.

## 8) QA y validacion
21. Checklist de validacion manual
    - Flujo login, crear post, comentar, chat, editar perfil.
    - Justificacion: reduce errores en entrega final.

22. Datos demo consistentes
    - Unificar datos entre AppState y MockUsers.
    - Justificacion: evita inconsistencias visibles.

## Notas
- Todas las mejoras propuestas mantienen el despliegue en GitHub Pages.
- No se incluyen frameworks ni backend propio.
- Cada item puede implementarse en pasos pequenos con impacto visible.
