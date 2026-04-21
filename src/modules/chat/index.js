/**
 * Chat Module - Real-time messaging and conversations
 * Public interface for all chat-related functionality
 */

// Services
export { chatService } from './chatService.js';
export { chatRepository } from './chatRepository.js';

// State management
export { 
  getMessages, 
  setMessages, 
  addMessage,
  getConversations,
  setConversations,
  subscribeToChatChanges 
} from './chatState.js';

// UI Managers
export { ChatManager } from './ChatManager.js';

