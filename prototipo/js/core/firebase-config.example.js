/**
 * firebase-config.example.js
 * 
 * ARCHIVO DE EJEMPLO - NO CONTIENE CREDENCIALES REALES
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo: cp firebase-config.example.js firebase-config.js
 * 2. Abre firebase-config.js
 * 3. Reemplaza "TU_*" con tus credenciales reales de Firebase
 * 4. NUNCA hace git add firebase-config.js (ya está en .gitignore)
 * 
 * Obtén credenciales en: https://console.firebase.google.com
 * → Proyecto → Configuración del proyecto → Aplicaciones web
 */

const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_AUTH_DOMAIN_AQUI",
    projectId: "TU_PROJECT_ID_AQUI",
    storageBucket: "TU_STORAGE_BUCKET_AQUI",
    messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI",
    appId: "TU_APP_ID_AQUI",
    measurementId: "TU_MEASUREMENT_ID_AQUI"
};

// Inicializar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const firebaseReady = true;
export default firebaseConfig;
