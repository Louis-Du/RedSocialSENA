/**
 * firebase-config.js - Configuración de Firebase
 * 
 * Este archivo contiene la configuración necesaria para conectar
 * la aplicación con Firebase (Authentication, Firestore, Storage)
 * 
 * INSTRUCCIONES:
 * 1. Crear un proyecto en Firebase Console (https://console.firebase.google.com)
 * 2. Habilitar Authentication (Email/Password)
 * 3. Crear base de datos Firestore
 * 4. Habilitar Storage para imágenes
 * 5. Obtener las credenciales del proyecto
 * 6. Reemplazar los valores de configuración abajo con tus credenciales reales
 * 7. Nunca commitear este archivo con las credenciales reales a un repositorio público
 */

// TODO: Reemplazar con las credenciales de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_AUTH_DOMAIN_AQUI",
    projectId: "TU_PROJECT_ID_AQUI",
    storageBucket: "TU_STORAGE_BUCKET_AQUI",
    messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI",
    appId: "TU_APP_ID_AQUI",
    measurementId: "TU_MEASUREMENT_ID_AQUI" // Opcional
};

// Inicializar Firebase (descomentar cuando se tengan las credenciales)
// import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
// import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
// import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
// import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

// Por ahora, exportar configuración vacía
export const firebaseReady = false;
export default firebaseConfig;
