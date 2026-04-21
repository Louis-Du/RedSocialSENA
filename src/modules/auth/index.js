/**
 * Auth Module - User authentication and profile management
 * Public interface for all auth-related functionality
 */

// Services
export { userService } from './userService.js';
export { userRepository } from './userRepository.js';

// State management
export { 
  getCurrentUser, 
  setCurrentUser, 
  getAuthData, 
  setAuthData,
  subscribeToAuthChanges 
} from './authState.js';

// UI Managers (these are instantiated in main.js)
export { AuthManager } from './AuthManager.js';
export { RegisterManager } from './RegisterManager.js';
export { ProfileManager } from './ProfileManager.js';
export { OtherProfileManager } from './OtherProfileManager.js';
