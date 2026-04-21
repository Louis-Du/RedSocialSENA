// Bridge module: keeps legacy imports working.
// Many modules import `../AppState.js`; re-export the real singleton.
export { appState } from './core/AppState.js';
