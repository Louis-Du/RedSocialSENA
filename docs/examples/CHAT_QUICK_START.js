/**
 * GUÍA RÁPIDA - Sistema de Chat Firebase
 * Ejemplos prácticos y snippets listos para copiar
 * 
 * Fecha: 13 de febrero de 2026
 */

// ============================================================
// 1. INICIALIZAR SISTEMA
// ============================================================

import { chatManager } from './prototipo/js/ui/ChatManager.js';
import { chatService } from './prototipo/js/services/ChatService.js';
import { messageManager } from './prototipo/js/ui/MessageManager.js';

// ✅ Automático: ChatManager se inicializa al importar
// Ya está escuchando cambios en la lista de chats


// ============================================================
// 2. CHAT PRIVADO (1 a 1)
// ============================================================

// Crear o abrir chat privado con otro usuario
async function abrirChatPrivado(otherUserId) {
    try {
        // Crea el chat si no existe, o retorna ID si existe
        const chatId = await chatService.createPrivateChat(otherUserId);
        
        // Abrir en UI
        await chatManager.openChat(chatId);
        
        messageManager.success('Chat abierto');
    } catch (error) {
        messageManager.error('Error: ' + error.message);
    }
}

// Uso:
// abrirChatPrivado('user123');


// ============================================================
// 3. CHAT GRUPAL
// ============================================================

// Crear un nuevo grupo
async function crearGrupo(nombreGrupo, miembrosIds, fotoURL = null) {
    try {
        // Crear grupo
        const chatId = await chatService.createGroupChat(
            nombreGrupo,
            miembrosIds,  // Array de UIDs (sin el usuario actual)
            fotoURL       // Opcional
        );
        
        // Abrir en UI
        await chatManager.openChat(chatId);
        
        messageManager.success('Grupo creado exitosamente');
        return chatId;
    } catch (error) {
        messageManager.error('Error al crear grupo: ' + error.message);
    }
}

// Uso:
// crearGrupo('Desarrollo SENA', ['user123', 'user456']);


// ============================================================
// 4. AGREGAR MIEMBROS A GRUPO
// ============================================================

async function agregarMiembrosAlGrupo(chatId, nuevosUserIds) {
    try {
        await chatService.addGroupParticipants(chatId, nuevosUserIds);
        messageManager.success('Miembros agregados');
    } catch (error) {
        messageManager.error('Error: ' + error.message);
    }
}

// Uso:
// agregarMiembrosAlGrupo('chat123', ['user789']);


// ============================================================
// 5. REMOVER MIEMBRO DEL GRUPO
// ============================================================

async function removerDelGrupo(chatId, userId) {
    try {
        await chatService.removeGroupParticipant(chatId, userId);
        messageManager.success('Miembro removido');
    } catch (error) {
        messageManager.error('Error: ' + error.message);
    }
}


// ============================================================
// 6. ENVIAR MENSAJE (se hace desde ChatManager/UI)
// ============================================================

// Los usuarios envían desde el input normalmente
// ChatManager maneja:
// - chatManager.sendMessage('desktop') → desde botón enviar
// - Automáticamente comprime y sube imágenes a Storage
// - Actualiza lastMessage del chat

// Para enviar programáticamente:
async function enviarMensajeDirecto(chatId, texto, archivoImagen = null) {
    try {
        const result = await chatService.sendMessage(chatId, texto, archivoImagen);
        
        if (result.success) {
            messageManager.success('Mensaje enviado');
            return result.messageId;
        } else {
            messageManager.error(result.error);
        }
    } catch (error) {
        messageManager.error('Error: ' + error.message);
    }
}


// ============================================================
// 7. ESCUCHAR MENSAJES EN TIEMPO REAL
// ============================================================

// Ya lo hace ChatManager automáticamente cuando abres un chat
// Pero si necesitas hacerlo manualmente:

function configurarListenerMensajes(chatId) {
    const unsubscribe = chatService.listenToMessages(
        chatId,
        (error, messages) => {
            if (error) {
                console.error('Error:', error);
                return;
            }
            
            // messages contiene array de objetos con:
            // - id: string
            // - fromUserId: string
            // - content: string
            // - imageUrl: string | null
            // - readBy: string[]
            // - createdAt: timestamp
            
            console.log('Mensajes:', messages);
            
            // Tu código para renderizar...
        }
    );
    
    // Para detener la escucha:
    // unsubscribe();
    
    return unsubscribe;
}


// ============================================================
// 8. ESCUCHAR LISTA DE CHATS DEL USUARIO
// ============================================================

// Ya lo hace ChatManager automáticamente
// Pero para hacerlo manualmente:

function configurarListenerChats() {
    const unsubscribe = chatService.listenToUserChats(
        (error, chats) => {
            if (error) {
                console.error('Error:', error);
                return;
            }
            
            // chats contiene array de documentos con:
            // - id: string (chatId)
            // - type: 'private' | 'group'
            // - participants: string[]
            // - name: string | null
            // - photoURL: string | null
            // - lastMessage: { content, fromUserId, timestamp, hasImage }
            // - createdAt: timestamp
            // - updatedAt: timestamp
            
            console.log('Mis chats:', chats);
            
            // Tu código para renderizar...
        }
    );
    
    return unsubscribe;
}


// ============================================================
// 9. INDICADOR DE ESCRITURA (TYPING)
// ============================================================

// ChatManager lo maneja automáticamente durante la escritura
// Pero aquí está disponible si lo necesitas:

// Mostrar que estoy escribiendo
async function mostrarQueEstoyEscribiendo(chatId) {
    await chatService.setTyping(chatId, true);
}

// Dejar de mostrar que estoy escribiendo
async function dejarDeEscribir(chatId) {
    await chatService.setTyping(chatId, false);
}

// Escuchar quién está escribiendo
function configurarListenerTyping(chatId) {
    const unsubscribe = chatService.listenToTyping(
        chatId,
        (error, typingUserIds) => {
            if (error) {
                console.error('Error:', error);
                return;
            }
            
            // typingUserIds es array de UIDs de usuarios escribiendo
            console.log('Escribiendo:', typingUserIds);
            
            // Mostrar "Usuario está escribiendo..."
            if (typingUserIds.length > 0) {
                console.log(`${typingUserIds.length} usuario(s) escribiendo`);
            }
        }
    );
    
    return unsubscribe;
}


// ============================================================
// 10. MARCAR MENSAJES COMO LEÍDO
// ============================================================

async function marcarComoLeido(chatId, messageId) {
    try {
        await chatService.markMessageAsRead(chatId, messageId);
        console.log('Marcado como leído');
    } catch (error) {
        console.error('Error:', error);
    }
}

// ChatManager lo hace automáticamente cuando abres un chat


// ============================================================
// 11. LIMPIAR RECURSOS (IMPORTANTE)
// ============================================================

// Llamar esto cuando se desmonte el componente o cierre la app
function limpiarRecursos() {
    // Detiene todos los listeners de ChatManager
    chatManager.destroy();
    
    // Opcionalmente, limpiar también desde ChatService
    chatService.cleanup();
}

// Recomendado en main.js o index.html
window.addEventListener('beforeunload', () => {
    limpiarRecursos();
});


// ============================================================
// 12. INTEGRACIÓN CON EVENT LISTENERS DEL DOM
// ============================================================

// Ejemplo: Botón para abrir chat con un usuario
document.addEventListener('click', async (e) => {
    // Botón "Iniciar chat"
    if (e.target.classList.contains('btn-start-chat')) {
        const userId = e.target.dataset.userId;
        await abrirChatPrivado(userId);
    }
    
    // Botón "Crear grupo"
    if (e.target.classList.contains('btn-create-group')) {
        // Asumir que tienes un modal para seleccionar miembros
        const groupName = prompt('Nombre del grupo:');
        const miembros = ['user123', 'user456']; // Obtener de formulario
        await crearGrupo(groupName, miembros);
    }
});


// ============================================================
// 13. MANEJO DE ERRORES
// ============================================================

// Todos los métodos retornan errores específicos:
async function ejemploManejoDeerrores() {
    try {
        await chatService.createPrivateChat(otherUserId);
    } catch (error) {
        if (error.message.includes('no autenticado')) {
            messageManager.error('Debes iniciar sesión');
        } else if (error.message.includes('mismo')) {
            messageManager.error('No puedes chatear contigo mismo');
        } else {
            messageManager.error('Error inesperado: ' + error.message);
        }
    }
}


// ============================================================
// 14. ESTRUCTURA FIRESTORE REAL (VALIDAR)
// ============================================================

/*
Firestore:

chats/
├── user1_user2/
│   ├── type: "private"
│   ├── participants: ["user1", "user2"]
│   ├── createdBy: "user1"
│   ├── name: null
│   ├── photoURL: null
│   ├── lastMessage: { content: "Hola", fromUserId: "user2", hasImage: false, timestamp: 2/13/26 }
│   ├── createdAt: 2/10/26
│   ├── updatedAt: 2/13/26
│   └── messages/
│       ├── msg123/
│       │   ├── fromUserId: "user1"
│       │   ├── content: "Texto del mensaje"
│       │   ├── imageUrl: null
│       │   ├── readBy: ["user1", "user2"]
│       │   └── createdAt: 2/13/26
│       └── msg124/...
│
├── group789/
│   ├── type: "group"
│   ├── name: "Desarrollo SENA"
│   ├── participants: ["user1", "user2", "user3"]
│   ├── createdBy: "user1"
│   ├── photoURL: "gs://..."
│   ├── lastMessage: {...}
│   └── messages/
│
└── user3_user4/...

Storage:
gs://bucket/chat-images/
├── user1_user2/
│   ├── 1707862400000_photo.jpg
│   └── 1707862410000_selfie.png
└── group789/
    └── 1707862420000_screenshot.png
*/


// ============================================================
// 15. CHECKLIST DE SEGURIDAD
// ============================================================

/*
ANTES DE PRODUCCIÓN:

✅ Firebase Config seguro (no commitear credenciales)
✅ Firestore Rules copiadas y publicadas
✅ Storage Rules configuradas
✅ Auth habilitada (Email, Google, etc.)
✅ Límites de cuotas configurados
✅ CORS configurados si es necesario
✅ Listeners terminados en beforeunload
✅ Validación de participantes en cada operación
✅ Imágenes comprimidas antes de subir
✅ Manejo de errores en todos los métodos
✅ Testing con Firebase Emulator
*/


// ============================================================
// 16. DEBUGGING
// ============================================================

// Habilitar logs de Firestore (desarrollo solo)
import { enableLogging } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// enableLogging(true); // Descomentar solo en desarrollo


// ============================================================
// 17. OPTIMIZACIONES
// ============================================================

/*
Para mantener buena performance:

1. Indexar por updatedAt en chats
   - Firestore sugiere crear índices automáticamente

2. Establecer TTL en documents typing
   - Ver: Firebase TTL policies

3. Cachear usuarios para no hacer lookups repetidos
   - Ver UserService

4. Paginar mensajes antiguos (lazy load)
   - Implementar cursor-based pagination

5. Comprimir imágenes antes de subir
   - Ver utils.js
*/


// ============================================================
// EJEMPLO COMPLETO: Integración en HTML
// ============================================================

/*

<button class="btn-start-chat" data-user-id="user123">
  Chat con Juan
</button>

<button class="btn-create-group">
  Crear Grupo
</button>

<script type="module">
  import { chatManager } from './js/ui/ChatManager.js';
  import { messageManager } from './js/ui/MessageManager.js';
  
  // Ya está inicializado
  
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-start-chat')) {
      const userId = e.target.dataset.userId;
      const chatId = await chatService.createPrivateChat(userId);
      await chatManager.openChat(chatId);
    }
  });
  
  // Limpiar al cerrar
  window.addEventListener('beforeunload', () => {
    chatManager.destroy();
  });
</script>

*/


export {
  abrirChatPrivado,
  crearGrupo,
  agregarMiembrosAlGrupo,
  removerDelGrupo,
  enviarMensajeDirecto,
  configurarListenerMensajes,
  configurarListenerChats,
  mostrarQueEstoyEscribiendo,
  dejarDeEscribir,
  configurarListenerTyping,
  marcarComoLeido,
  limpiarRecursos
};
