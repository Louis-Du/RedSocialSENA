# Decisiones tecnicas

## Objetivo
Dejar el prototipo listo para evaluacion academica, con flujo de login claro, mensajes coherentes y sin indicios de demo incompleta.

## Decisiones principales
1. Datos de usuarios simulados
   - Fuente unica: MockUsers.js y AppState.js mantienen la misma estructura de campos.
   - Se prioriza coherencia entre login y vistas de perfil.

2. Login simulado con credenciales visibles
   - Se muestra el listado de usuarios y la contrasena demo en la vista de login.
   - Esto evita ambiguedad en evaluacion y acelera la navegacion.

3. Mensajes coherentes y academicos
   - Se centraliza en MessageManager para consistencia visual.
   - Se reemplazan alertas y textos informales por mensajes claros.

4. Estados vacios pulidos
   - Feed y chats muestran estados vacios con indicaciones de accion.
   - Se evita UI en blanco que sugiera error o falta de datos.

5. Assets locales y sin dependencias externas
   - Placeholders y avatar se alojan en assets/placeholders.
   - Se agrega favicon local para evitar warning del navegador.

6. Cero logs en consola
   - Se eliminan console.log/console.warn/console.error en UI.
   - Se evita ruido durante la evaluacion.

## Consideraciones
- Tailwind por CDN se mantiene por simplicidad del prototipo.
- Estructura preparada para migrar a backend sin romper UI.
