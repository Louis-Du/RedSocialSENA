# 🔥 Migración UserService a Firebase - COMPLETADA

## ✅ Cambios Realizados

### 1. UserService.js - Refactorización Completa
- ✅ **Eliminado**: appState, validateCredentials, errorHandler, dataMapper
- ✅ **Agregado**: Firebase Auth (signIn, register, logout)
- ✅ **Agregado**: Firestore users collection para perfiles

### 2. Métodos Migrados

#### `login(tipoDoc, documento, password)`
- Convierte documento → email sintético (`CC_12345678@redsocialsena.local`)
- Usa `signInWithEmailAndPassword(auth, email, password)`
- Obtiene perfil de Firestore con `getUserById(uid)`

#### `register(userData)`
- Crea usuario en Firebase Auth con `createUserWithEmailAndPassword()`
- Crea documento en `users/{uid}` con perfil completo
- Retorna usuario recién creado

#### `logout()`
- Usa `signOut(auth)` para cerrar sesión
- Limpia `currentUserData`

#### `getCurrentUser()`
- Ya no usa appState
- Retorna `auth.currentUser` + datos de Firestore cargados

#### `getUserById(userId)`
- Lee desde Firestore: `getDoc(doc(db, 'users', userId))`
- Retorna null si no existe

#### `updateProfile(updates)`
- Actualiza documento en Firestore
- Solo el usuario puede actualizar su propio perfil

### 3. Firestore Rules Actualizadas
- ✅ Agregadas reglas para colección `users`
- ✅ READ: Todos los autenticados pueden ver perfiles
- ✅ CREATE: Solo al registrarse (uid debe coincidir)
- ✅ UPDATE: Solo el propietario
- ✅ DELETE: Bloqueado desde cliente

---

## 📋 Pasos para Aplicar Cambios

### Paso 1: Publicar Reglas de Firestore

1. Ve a: [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **red-social-sena**
3. Ve a: **Firestore Database** → **Reglas**
4. **Copia y pega** el contenido de `FIRESTORE_RULES.js`
5. Haz clic en **Publicar**

⚠️ **IMPORTANTE**: Las reglas de `users` DEBEN estar publicadas antes de crear el primer usuario.

### Paso 2: Verificar Firebase Config

Asegúrate de que `firebase-config.js` tenga:
```javascript
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## 🧪 Testing - Flujo Completo

### Test 1: Registro de Usuario

1. Abre el navegador: http://127.0.0.1:8080
2. Click en **Registrarse**
3. Llena el formulario:
   - **Tipo**: CC
   - **Documento**: `12345678`
   - **Nombre**: `Juan Pérez`
   - **Contraseña**: `test123`
   - **Rol**: Aprendiz
   - **Programa**: ADSO
   - **Ciudad**: Bogotá
4. Click **Registrar**

**Esperado**:
- ✅ Mensaje: "Cuenta creada exitosamente"
- ✅ Redirección automática al feed
- ✅ En Firebase Console → Authentication: Aparece `cc_12345678@redsocialsena.local`
- ✅ En Firebase Console → Firestore → users: Aparece el documento con el UID

### Test 2: Login

1. Cierra sesión (si estás logueado)
2. Click en **Iniciar Sesión**
3. Ingresa:
   - **Tipo**: CC
   - **Documento**: `12345678`
   - **Contraseña**: `test123`
4. Click **Ingresar**

**Esperado**:
- ✅ Mensaje: "Bienvenido(a)"
- ✅ Redirección al feed
- ✅ Nombre del usuario aparece en la navbar

### Test 3: Crear Post

1. Estando logueado, ve al feed
2. Click en **Nueva Publicación**
3. Escribe: "Primera post desde Firebase Auth 🔥"
4. Click **Publicar**

**Esperado**:
- ✅ Post aparece inmediatamente en el feed
- ✅ En Firebase Console → Firestore → posts: Aparece el documento
- ✅ `userId` del post coincide con tu UID

### Test 4: Sincronización Multi-Dispositivo 📱💻

1. **En PC**: Crea un post
2. **En Celular**: Abre http://IP_LOCAL:8080 (ej. http://192.168.1.55:8080)
3. **En Celular**: Regístrate con otro documento (ej. `87654321`)
4. **En Celular**: Observa el feed

**Esperado**:
- ✅ El post del PC aparece instantáneamente en el celular
- ✅ Si creas un post en el celular, aparece en el PC sin recargar
- ✅ Votos (upvote/downvote) se sincronizan en tiempo real

### Test 5: Edición de Perfil

1. Click en tu nombre (esquina superior derecha)
2. Click **Editar Perfil**
3. Cambia la bio: "Aprendiz ADSO - Firebase Developer"
4. Guarda cambios

**Esperado**:
- ✅ Cambios se guardan en Firestore
- ✅ Bio actualizada aparece en tu perfil

---

## 🐛 Troubleshooting

### Error: "Ya existe una cuenta con este documento"
**Causa**: Intentas registrar un documento que ya existe.
**Solución**: Usa otro documento o elimina la cuenta en Firebase Console → Authentication.

### Error: "Credenciales incorrectas"
**Causa**: Contraseña incorrecta o usuario no existe.
**Solución**: Verifica que hayas registrado el usuario antes de intentar login.

### Error: "Debes iniciar sesión para publicar"
**Causa**: `auth.currentUser` es null.
**Solución**:
1. Verifica que `firebase-config.js` exporta `auth`
2. Verifica que `login()` se completó correctamente
3. Abre Console del navegador y escribe: `console.log(auth.currentUser)`
   - Debería mostrar tu usuario, no null

### Posts no se sincronizan
**Causa**: Listener no está activo.
**Solución**:
1. Abre Console del navegador
2. Verifica logs: "Real-time listener active for posts"
3. Si no aparece, revisa `FeedRenderer.js` → `renderFullFeed()`

### Firestore Permission Denied
**Causa**: Reglas no publicadas o incorrectas.
**Solución**:
1. Ve a Firebase Console → Firestore → Reglas
2. Verifica que las reglas de `users` y `posts` estén ahí
3. Click **Publicar** nuevamente

---

## 📊 Estructura de Datos Firestore

### Colección: `users/{userId}`
```javascript
{
  tipoDoc: "CC",
  documento: "12345678",
  nombre: "Juan Pérez",
  apodo: "Juan",
  rol: "Aprendiz",
  email: "12345678@sena.edu.co",
  programa: "ADSO",
  ciudad: "Bogotá",
  bio: "Aprendiz del SENA",
  profilePicture: null,
  trimestre: "1° Trimestre",
  regional: "Centro SENA",
  centro: "Bogotá",
  etapa: "Lectiva",
  modalidad: "Presencial",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Colección: `posts/{postId}`
```javascript
{
  userId: "abc123...",           // UID del autor
  content: "Texto del post",
  imageUrl: null,
  votes: {
    upvotes: 0,
    downvotes: 0,
    usersVoted: {}
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔄 Próximos Pasos

1. ✅ **UserService migrado** - COMPLETADO
2. ✅ **PostService migrado** - COMPLETADO
3. ✅ **Firestore Rules publicadas** - PENDIENTE (manual)
4. ⏳ **CommentService** - Pendiente migración
5. ⏳ **Firebase Storage** - Pendiente configuración para imágenes

---

## 🚀 ¿Listo para Probar?

1. **Publica las reglas** en Firebase Console
2. **Abre**: http://127.0.0.1:8080
3. **Regístrate** con un nuevo documento
4. **Crea un post**
5. **Abre en otro dispositivo** y verifica sincronización

¡Tu aplicación ahora usa Firebase Auth + Firestore completamente! 🎉
