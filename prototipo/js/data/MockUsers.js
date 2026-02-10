/**
 * MockUsers.js - Base de datos de usuarios simulados
 * 
 * Este archivo contiene usuarios de demostración para desarrollo y pruebas.
 * NO usar en producción. NO almacenar contraseñas en texto plano en el cliente.
 * 
 * Estructura de usuario:
 * - id: UUID único
 * - tipoDoc: 'CC' (Cédula de Ciudadanía) | 'TI' (Tarjeta de Identidad) | 'CE' (Cédula de Extranjería)
 * - documento: Número de documento
 * - password: Contraseña en texto plano (SOLO para demo)
 * - nombre: Nombre completo
 * - email: Email (simulado)
 * - bio: Biografía corta
 * - profilePicture: URL de foto de perfil (simulada)
 * - ciudad: Ciudad de origen
 * - especialidad: Programa de formación SENA
 * - sobreMi: Descripción personal
 */

export const MOCK_USERS = [
    {
        id: 'user_1',
        tipoDoc: 'CC',
        documento: '1234567890',
        password: 'sena123',
        nombre: 'Daniel Esteban',
        apodo: 'Daniel Esteban',
        trimestre: '3° Trimestre',
        programa: 'Tecnólogo en Análisis y Desarrollo de Software',
        email: 'daniel.esteban@sena.edu.co',
        bio: 'Aprendiz apasionado por la tecnología',
        profilePicture: 'assets/placeholders/avatar-placeholder.svg',
        ciudad: 'Barrancabermeja',
        especialidad: 'Análisis y Desarrollo de Software',
        sobreMi: 'Aprendiz con enfoque en desarrollo web y bases de datos.'
    },
    {
        id: 'user_2',
        tipoDoc: 'CC',
        documento: '9876543210',
        password: 'sena123',
        nombre: 'María García',
        apodo: 'María',
        trimestre: '2° Trimestre',
        programa: 'Técnica en Administración de Sistemas',
        email: 'maria.garcia@sena.edu.co',
        bio: 'Especialista en redes',
        profilePicture: 'assets/placeholders/avatar-placeholder.svg',
        ciudad: 'Bogotá',
        especialidad: 'Administración de Sistemas',
        sobreMi: 'Aprendiz enfocada en redes y soporte de infraestructura.'
    },
    {
        id: 'user_3',
        tipoDoc: 'CC',
        documento: '5555555555',
        password: 'sena123',
        nombre: 'Carlos López',
        apodo: 'Carlos',
        trimestre: '1° Trimestre',
        programa: 'Técnica en Programación',
        email: 'carlos.lopez@sena.edu.co',
        bio: 'Frontend developer en formación',
        profilePicture: 'assets/placeholders/avatar-placeholder.svg',
        ciudad: 'Cali',
        especialidad: 'Programación',
        sobreMi: 'Aprendiz con interés en interfaces web y buenas practicas.'
    },
    {
        id: 'user_4',
        tipoDoc: 'TI',
        documento: '11223344',
        password: 'sena123',
        nombre: 'Ana Martínez',
        apodo: 'Ana',
        trimestre: '4° Trimestre',
        programa: 'Marketing Digital',
        email: 'ana.martinez@sena.edu.co',
        bio: 'Especialista en marketing digital y redes sociales',
        profilePicture: 'assets/placeholders/avatar-placeholder.svg',
        ciudad: 'Barranquilla',
        especialidad: 'Marketing Digital',
        sobreMi: 'Aprendiz enfocada en comunicacion digital y contenidos.'
    }
];

/**
 * Encuentra un usuario por tipo de documento y número
 * @param {string} tipoDoc - Tipo de documento (CC, TI, CE)
 * @param {string} documento - Número de documento
 * @returns {Object|null} Usuario encontrado o null
 */
export function findUserByDocument(tipoDoc, documento) {
    return MOCK_USERS.find(
        user => user.tipoDoc === tipoDoc && user.documento === documento
    );
}

/**
 * Valida credenciales de un usuario
 * Retorna el usuario sin la contraseña si es válido
 * @param {string} tipoDoc - Tipo de documento
 * @param {string} documento - Número de documento
 * @param {string} password - Contraseña
 * @returns {Object|null} Usuario autenticado sin password, o null si falla
 */
export function validateCredentials(tipoDoc, documento, password) {
    const user = findUserByDocument(tipoDoc, documento);
    
    if (!user) {
        return null;
    }
    
    // Validar contraseña
    if (user.password !== password) {
        return null;
    }
    
    // Retornar usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

/**
 * Obtiene todos los usuarios excepto uno
 * Útil para mostrar otros usuarios en chats, perfiles, etc.
 * @param {string} excludeUserId - ID del usuario a excluir
 * @returns {Array} Array de usuarios sin el usuario excluido
 */
export function getOtherUsers(excludeUserId) {
    return MOCK_USERS
        .filter(user => user.id !== excludeUserId)
        .map(user => {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
}

/**
 * Obtiene un usuario por ID
 * @param {string} userId - ID del usuario
 * @returns {Object|null} Usuario encontrado o null
 */
export function getUserById(userId) {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return null;
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
