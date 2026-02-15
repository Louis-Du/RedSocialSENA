/**
 * firebase-config.js - Configuración de Firebase
 * 
 * ⚠️ ERROR: auth/configuration-not-found?
 * 
 * Esto significa que las credenciales actuales NO SON VÁLIDAS:
 * - El proyecto Firebase fue eliminado
 * - Las credenciales expiradas
 * - Authentication no está habilitado
 * 
 * SOLUCIÓN:
 * 1. Ir a: https://console.firebase.google.com
 * 2. Crear proyecto NUEVO o usar existente
 * 3. Obtener credenciales (⚙️ Configuración → App)
 * 4. Reemplazar valores abajo con TUS credenciales
 * 5. Habilitar: Authentication, Firestore, Storage
 * 6. Recarga: Ctrl+Shift+R
 * 
 * VER: FIREBASE_CONFIG_NOT_FOUND_SOLUCION.md
 */

const firebaseConfig = {
    apiKey: "AIzaSyCOCB7_Sbk2GUVEr-rb7kNfX6ho814wiIs",

    authDomain: "redsena-b5ce4.firebaseapp.com",

    projectId: "redsena-b5ce4",

    storageBucket: "redsena-b5ce4.firebasestorage.app",

    messagingSenderId: "826632314205",

    appId: "1:826632314205:web:706dd0f617d446819a1cb4",

    measurementId: "G-KJPKF2WJGD"


};

// Log para DEBUG
console.log('🔧 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    hasApiKey: firebaseConfig.apiKey ? '✅' : '❌'
});

// Inicializar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Inicializar la app
const app = initializeApp(firebaseConfig);

// Exportar servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const firebaseReady = true;
export default firebaseConfig;

// Log para verificación
console.log('✅ Firebase inicializado correctamente');
