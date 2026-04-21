# 📱 Documentación del Sistema de Chat con Firebase

## 🏗️ Modelo de Datos Firestore

Se utilizan 3 colecciones principales:

### 1️⃣ Colección `chats`

Documentos generales de chat (privados y grupales).

```javascript
chats/{chatId}
{
  // Tipo de chat
  type: 'private' | 'group',
  
  // Array de UIDs de participantes autorizados
  participants: string[],
  
  // UID del usuario que creó el chat
  createdBy: string,
  
  // Nombre del grupo (null para chats privados)
  name: string | null,
  
  // URL de foto (null para privados, opcional para grupos)
  photoURL: string | null,
  
  // Último mensaje enviado (para preview en lista)
  lastMessage: {
    content: string,           // Texto o "[Imagen]"
    fromUserId: string,        // UID del remitente
    timestamp: timestamp,      // Cuándo fue enviado
    hasImage: boolean          // Si contiene imagen
  } | null,
  
  // Timestamps
  createdAt: timestamp,        // Creación del chat
  updatedAt: timestamp         // Última actualización
}
```

#### IDs Determinísticos para Chats Privados

Para garantizar que no haya duplicados, los chats privados usan IDs determinísticos:

```javascript
// IDs ordenados alfabéticamente
const chatId = [userId1, userId2].sort().join('_');
// Ejemplo: 'user123_user456' OR 'user456_user123' siempre resulta en 'user123_user456'
```

**Ventaja**: Los usuarios pueden crear o recuperar el mismo chat sin duplicados.

---

### 2️⃣ Subcolección `chats/{chatId}/messages`

Mensajes dentro de cada chat.

```javascript
chats/{chatId}/messages/{messageId}
{
  // UID del usuario que envió el mensaje
  fromUserId: string,
  
  // Contenido de texto (puede ser vacio si solo tiene imagen)
  content: string,
  
  // URL de imagen (null si no hay imagen)
  imageUrl: string | null,
  
  // Array de UIDs de usuarios que leyeron el mensaje
  readBy: string[],
  
  // Fecha de creación (serverTimestamp)
  createdAt: timestamp
}
```

**Características**:
- `createdAt` es immutable (protegido por Firestore Rules)
- `readBy` es aditivo (solo se agregan, nunca se quitan)
- `imageUrl` se obtiene desde Firebase Storage

---

### 3️⃣ Subcolección `chats/{chatId}/typing`

Indicadores de escritura en tiempo real.

```javascript
chats/{chatId}/typing/{userId}
{
  // Si el usuario está escribiendo en este momento
  isTyping: boolean,
  
  // Timestamp de la última actualización
  timestamp: timestamp
}
```

**Nota**: Se actualiza constantemente mientras el usuario escribe. Se elimina cuando deja de escribir (inactividad > 3 seg).

---

## 🔒 Seguridad

Todas las operaciones están protegidas por Firestore Rules (ver `FIRESTORE_RULES.js`):

### Reglas Clave

| Operación | Quien Puede | Regla |
|-----------|-----------|--------|
| **Leer chat** | Participantes | `participants` incluye `auth.uid` |
| **Crear chat** | Cualquiera autenticado | Con estructura válida |
| **Enviar mensaje** | Participantes | `fromUserId == auth.uid` |
| **Leer mensajes** | Participantes | Del chat padre |
| **Marcar leído** | Participantes | Solo agregar a `readBy` |
| **Agregar participantes (grupo)** | Solo creador | `createdBy == auth.uid` |
| **Indicador de escritura** | Solo el usuario | `userId == auth.uid` |

---

## 🎯 Arquitectura del Código

### 1. ChatService (Lógica)

Ubicación: [`prototipo/js/services/ChatService.js`](./prototipo/js/services/ChatService.js)

**Responsabilidades**:
- Interactuar con Firebase
- Manejar transacciones
- Listeners en tiempo real
- Validar permisos

**Métodos principales**:

```javascript
// Chats privados (1 a 1)
await chatService.createPrivateChat(otherUserId)
→ string (chatId)

// Chats grupales
await chatService.createGroupChat(groupName, [participantsIds], photoURL)
→ string (chatId)

// Enviar mensaje
await chatService.sendMessage(chatId, content, imageFile)
→ { success: boolean, messageId: string, error?: string }

// Escuchar mensajes en tiempo real
chatService.listenToMessages(chatId, (error, messages) => {})
→ function (unsubscribe)

// Escuchar lista de chats del usuario
chatService.listenToUserChats((error, chats) => {})
→ function (unsubscribe)

// Indicador de escritura
await chatService.setTyping(chatId, isTyping)
chatService.listenToTyping(chatId, (error, typingUserIds) => {})

// Marcar como leído
await chatService.markMessageAsRead(chatId, messageId)

// Limpiar listeners (IMPORTANTE al desmontar)
chatService.cleanup()
```

### 2. ChatManager (UI)

Ubicación: [`prototipo/js/ui/ChatManager.js`](./prototipo/js/ui/ChatManager.js)

**Responsabilidades**:
- Manejar eventos del DOM
- Renderizar lista de chats y mensajes
- Coordinar listeners
- Mostrar feedback visual

**Métodos públicos**:

```javascript
// Abrir chat
await chatManager.openChat(chatId)

// Enviar mensaje
await chatManager.sendMessage('desktop' | 'mobile')

// Limpiar todos los listeners
chatManager.destroy()
```

### 3. MessageManager (Feedback)

Ubicación: [`prototipo/js/ui/MessageManager.js`](./prototipo/js/ui/MessageManager.js)

Muestra alertas visuales (error, success, warning, info).

---

## 📊 Flujo de Una Conversación Privada

```
1. CREAR CHAT PRIVADO
   User A → chatService.createPrivateChat(userB.uid)
   ↓
   Firebase crea: chats/{sortedIds}
   ↓
   Ambos usuarios ven el chat en su lista

2. USER A ENVÍA MENSAJE
   User A → chatManager.sendMessage()
   ↓
   chatService.sendMessage(chatId, texto, imagen)
   ↓
   TRANSACCIÓN:
   - Crear mensaje en messages/
   - Actualizar lastMessage en chat/
   ↓
   Firebase Rules: Valida que User A esté en participants

3. USER B RECIBE MENSAJE EN TIEMPO REAL
   chatService.listenToMessages() → onSnapshot
   ↓
   Render auto de UI
   ↓
   chatService.markMessageAsRead()

4. INDICADOR DE ESCRITURA
   User A escribe → chatService.setTyping(true)
   ↓
   User B ve: "está escribiendo..."
   ↓
   User A deja => chatService.setTyping(false)
```

---

## 🚀 Cómo Integrar en tu Proyecto

### Paso 1: Configurar Firebase

Actualizar `prototipo/js/firebase-config.js`:

```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Paso 2: Habilitar Auth en Firebase Console

- Authentication → Enable Email/Password
- Enable Anonymous (si aplica)

### Paso 3: Copiar Firestore Rules

- Firestore → Rules
- Copiar contenido de `FIRESTORE_RULES.js`
- Publicar

### Paso 4: Configurar Storage

- Storage → Create Bucket
- URL en nombre: `gs://your-project.appspot.com`
- Security rules:
  ```
  match /chat-images/{allPaths=**} {
    allow read: if request.auth != null;
    allow write: if request.auth != null;
  }
  ```

### Paso 5: Importar en HTML

```html
<script type="module">
    import { chatManager } from './prototipo/js/ui/ChatManager.js';
    // Ya está inicializado y escuchando
    
    // Cuando se desmonte:
    window.addEventListener('beforeunload', () => {
        chatManager.destroy();
    });
</script>
```

---

## 📈 Flujo de Datos

```
┌─────────────────────────────────────────┐
│          USER INTERFACE                  │
│  (buttons, inputs, list view)            │
└──────────────┬──────────────────────────┘
               │ event listeners
┌──────────────▼──────────────────────────┐
│         CHAT MANAGER                     │
│  (DOM rendering, event handling)         │
└──────────────┬──────────────────────────┘
               │ method calls
┌──────────────▼──────────────────────────┐
│         CHAT SERVICE                     │
│  (Firebase business logic)               │
└──────────────┬──────────────────────────┘
               │ API calls
┌──────────────▼──────────────────────────┐
│  FIREBASE (Firestore + Storage)          │
│  (persistence + realtime listeners)      │
└─────────────────────────────────────────┘
```

---

## ⚠️ Consideraciones Importantes

### 1. **Limpieza de Listeners**

Siempre llamar `chatService.cleanup()` al desmontar:

```javascript
// Al cerrar app o cambiar de página
window.addEventListener('beforeunload', () => {
    chatService.cleanup();
    chatManager.destroy();
});
```

**Por qué**: Evita memory leaks y lecturas innecesarias de Firestore.

### 2. **Transacciones para Consistency**

El envío de mensajes usa `runTransaction()`:

```javascript
const messageId = await runTransaction(db, async (transaction) => {
    // 1. Crear mensaje
    transaction.set(messageRef, {...});
    // 2. Actualizar lastMessage del chat
    transaction.update(chatRef, {...});
    return messageId;
});
```

**Garantiza**: Si falla uno, falla ambos (sin inconsistencias).

### 3. **IDs Determinísticos en Privados**

```javascript
// CORRECTO: No hay duplicados
const chatId = [userId1, userId2].sort().join('_');

// MALO: Podría crear duplicados
const chatId = `${userId1}_${userId2}`;
```

### 4. **Imágenes en Storage**

```
chat-images/
├── {chatId}/
│   ├── 1707862400000_photo.jpg
│   ├── 1707862410000_selfie.png
│   └── ...
```

**Ruta**: `chat-images/{chatId}/{timestamp}_{filename}`

### 5. **serverTimestamp() es CRÍTICO**

```javascript
// ✅ CORRECTO: Usa reloj del servidor
createdAt: serverTimestamp()

// ❌ MALO: Usa reloj del cliente (no confiable)
createdAt: Date.now()
```

---

## 🧪 Testing

Usar Firebase Emulator Suite:

```bash
cd prototipo
firebase emulators:start

# En desarrollo:
# auth.emulatorConfig = ...
# db.useEmulator('localhost', 8080)
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Crear Chat Privado

```javascript
// En main.js o donde manejes acciones del usuario
const handleStartChat = async (otherUserId) => {
    try {
        const chatId = await chatService.createPrivateChat(otherUserId);
        await chatManager.openChat(chatId);
        messageManager.success('Chat abierto');
    } catch (error) {
        messageManager.error('Error: ' + error.message);
    }
};
```

### Ejemplo 2: Crear Grupo

```javascript
const handleCreateGroup = async (groupName, memberIds) => {
    try {
        const chatId = await chatService.createGroupChat(groupName, memberIds);
        await chatManager.openChat(chatId);
        messageManager.success('Grupo creado');
    } catch (error) {
        messageManager.error('Error: ' + error.message);
    }
};
```

### Ejemplo 3: Inicializar

```javascript
// main.js
import { chatManager } from './ui/ChatManager.js';
import { chatService } from './services/ChatService.js';

// ChatManager ya está inicializado en constructor
// Escucha cambios automáticamente

// Al desmontar
window.addEventListener('unload', () => {
    chatManager.destroy();
    chatService.cleanup();
});
```

---

## 🔗 Referencias

- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Realtime Listeners](https://firebase.google.com/docs/firestore/query-data/listen)

---

**Última actualización**: 13 de febrero de 2026
**Versión**: 1.0.0 (Producción)
