# DEBUG - Problema de Perfil

## 🔴 Problema Reportado
- Los chats no muestran cambios
- Sigue mostrando un perfil diferente al usuario logueado

## 🔧 Pasos para Debug

### 1. Limpiar Caché Completamente

**IMPORTANTE**: Los navegadores cachean archivos JavaScript. Debes hacer esto:

```bash
# Opción A: En Firefox
1. Presiona Ctrl+Shift+R (hard refresh)
2. O presiona F12 → Pestaña "Red/Network" → Activar "Deshabilitar caché"

# Opción B: Limpiar localStorage y caché
1. F12 (Abrir consola)
2. En la consola escribir:
   localStorage.clear()
   location.reload(true)
```

### 2. Verificar Errores en Consola

1. Presiona **F12** para abrir DevTools
2. Ve a la pestaña **Console**
3. Busca errores en rojo ⛔
4. Copia y pega cualquier error que veas

### 3. Ver Debug de Navegación

Con F12 abierto y en la pestaña Console, deberías ver mensajes como:

```
[NavigationManager] Dispatching editProfileShown with params: {...}
[ProfileManager] loadProfile called with userId: ...
[ProfileManager] currentUser: user_1 Daniel Esteban
[ProfileManager] isOwnProfile: true viewedUserId: user_1
[ProfileManager] viewedUser: user_1 Daniel Esteban
```

### 4. Verificar Usuario Actual

En la consola de navegador (F12), escribe:

```javascript
// Ver usuario actual
userService.getCurrentUser()

// Resultado esperado:
// { id: 'user_1', nombre: 'Daniel Esteban', ... }
```

### 5. Probar Navegación Manual

En la consola, prueba:

```javascript
// Ir a perfil propio
navigationManager.navigateToProfile()

// Ir a perfil de otro usuario
navigationManager.navigateToProfile('user_2')

// Ver parámetros actuales
navigationManager.getNavigationParams()
```

### 6. Verificar Estado de Chats

En la consola:

```javascript
// Ver todos los chats
appState.chats

// Resultado esperado: {} (vacío)

// Ver conversaciones
chatService.getAllConversations()

// Debe retornar array de usuarios simulados sin mensajes
```

## 🐛 Si Sigue sin Funcionar

### Verifica el Orden de Carga de Módulos

1. F12 → Console
2. Escribe:

```javascript
// Verificar que ProfileManager existe
profileManager

// Verificar que NavigationManager existe
navigationManager

// Verificar que los métodos existen
navigationManager.navigateToProfile
navigationManager.getNavigationParams
```

### Revisa el HTML

El div del perfil debe existir:

```javascript
// En consola
document.querySelector('#editProfileView')
document.querySelector('#content1')
```

## 📝 Información a Reportar

Si aún no funciona, por favor reporta:

1. **Errores en consola** (copiar y pegar)
2. **Output de estos comandos**:
   ```javascript
   userService.getCurrentUser()
   navigationManager.getNavigationParams()
   window.location.hash
   ```
3. **Qué usuario usaste para login**
4. **Qué perfil se muestra incorrectamente**

## ✅ Prueba Rápida

1. Abre: http://localhost:8080/index.html
2. F12 → Console
3. Escribe y ejecuta:
   ```javascript
   localStorage.clear()
   location.reload(true)
   ```
4. Haz login nuevamente
5. F12 → Console (dejar abierta para ver logs)
6. Ve a "Editar Perfil"
7. Verifica los logs en consola
8. Verifica que el perfil mostrado es el correcto

## 🎯 Test Alternativo

Abre esta página para probar navegación:
http://localhost:8080/test_profile.html

Esta página tiene botones de prueba para verificar la navegación funciona correctamente.
