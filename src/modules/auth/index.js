/**
 * Auth Module - Interfaz pública
 * Importar desde aquí en lugar de acceder a archivos internos del módulo.
 */

export { userService } from './userService.js';
export { userRepository } from './userRepository.js';
export { userState } from './authState.js';

export { authManager } from './AuthManager.js';
export { registerManager } from './RegisterManager.js';
export { profileManager } from './ProfileManager.js';
export { otherProfileManager } from './OtherProfileManager.js';
