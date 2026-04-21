/* ========================================
   SCRIPT DE DIAGNÓSTICO - Firebase Auth
   ========================================
   
   Cópialo y pégalo en la CONSOLA del navegador (F12)
   para verificar el estado de autenticación
   ======================================== */

console.log('🔍 DIAGNÓSTICO DE FIREBASE AUTH\n');

// 1. Verificar si Firebase está inicializado
try {
    console.log('1️⃣ Firebase Config:', {
        apiKey: auth.app.options.apiKey.substring(0, 10) + '...',
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain
    });
    console.log('   ✅ Firebase inicializado correctamente\n');
} catch (e) {
    console.error('   ❌ Error:', e.message, '\n');
}

// 2. Verificar usuario actual
console.log('2️⃣ Estado de Autenticación:');
if (auth.currentUser) {
    console.log('   ✅ Usuario autenticado:');
    console.log('   - UID:', auth.currentUser.uid);
    console.log('   - Email:', auth.currentUser.email);
    console.log('   - Documento:', auth.currentUser.email.split('@')[0]);
} else {
    console.log('   ❌ NO hay usuario autenticado');
    console.log('   📋 Necesitas:');
    console.log('      1. Hacer LOGOUT si estás "logueado" (el estado está corrupto)');
    console.log('      2. REGISTRARTE con un nuevo documento');
    console.log('      3. Hacer LOGIN con ese documento\n');
}
console.log('');

// 3. Verificar UserService
console.log('3️⃣ UserService State:');
console.log('   - authInitialized:', userService.authInitialized);
console.log('   - currentUserData:', userService.currentUserData);
console.log('   - isLoggedIn():', userService.isLoggedIn());
console.log('');

// 4. Intentar leer posts (para verificar permisos)
console.log('4️⃣ Test de Permisos Firestore:');
console.log('   Intentando leer posts...');

import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

getDocs(collection(db, 'posts'))
    .then((snapshot) => {
        console.log('   ✅ Permisos OK - Posts leídos:', snapshot.size);
        if (snapshot.size === 0) {
            console.log('   ℹ️  No hay posts todavía (esto es normal si es la primera vez)');
        }
    })
    .catch((error) => {
        console.error('   ❌ Error de permisos:', error.code);
        if (error.code === 'permission-denied') {
            console.log('   📋 CAUSAS POSIBLES:');
            console.log('      1. No publicaste las reglas en Firebase Console');
            console.log('      2. No estás autenticado (auth.currentUser es null)');
            console.log('      3. Las reglas requieren autenticación y no hay sesión');
            console.log('');
            console.log('   🔧 SOLUCIÓN:');
            console.log('      1. Ve a: https://console.firebase.google.com/project/red-social-sena/firestore/rules');
            console.log('      2. Publica las reglas (están en FIRESTORE_RULES.js)');
            console.log('      3. Recarga la página');
        }
    });

console.log('');
console.log('========================================');
console.log('💡 ACCIONES RECOMENDADAS:');
console.log('========================================');
console.log('');
console.log('Si auth.currentUser es NULL:');
console.log('  1. Haz click en REGISTRARSE');
console.log('  2. Llena el formulario (documento: 12345678, password: test123)');
console.log('  3. Click REGISTRAR');
console.log('  4. Deberías ver "Cuenta creada exitosamente"');
console.log('');
console.log('Si ves "permission-denied":');
console.log('  1. Ve a Firebase Console → Firestore → Reglas');
console.log('  2. Copia las reglas de FIRESTORE_RULES.js');
console.log('  3. Publica las reglas');
console.log('');
console.log('========================================');
