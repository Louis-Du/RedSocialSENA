/**
 * MockUsers.js - Base de datos de usuarios simulados
 * 
 * Este archivo contiene usuarios de demostración para desarrollo y pruebas.
 * NO usar en producción. NO almacenar contraseñas en texto plano en el cliente.
 * 
 * Estructura de usuario:
 * - id: UUID único
 * - tipoDocumento: 'CC' (Cédula de Ciudadanía) | 'TI' (Tarjeta de Identidad) | 'CE' (Cédula de Extranjería)
 * - numeroDocumento: Número de documento
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
        id: 'user-001',
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        password: 'sena123',
        nombre: 'Daniel Rodríguez',
        email: 'daniel.rodriguez@sena.edu.co',
        bio: 'Desarrollador apasionado por la tecnología',
        profilePicture: 'https://ui-avatars.com/api/?name=Daniel+Rodriguez&background=2D8659&color=fff',
        ciudad: 'Medellín',
        especialidad: 'Análisis y Desarrollo de Sistemas de Información',
        sobreMi: 'Estudiante de SENA enfocado en desarrollo web y backend. Interesado en JavaScript, Python y bases de datos.'
    },
    {
        id: 'user-002',
        tipoDocumento: 'CC',
        numeroDocumento: '1098765432',
        password: 'sena123',
        nombre: 'María García',
        email: 'maria.garcia@sena.edu.co',
        bio: 'Diseñadora gráfica y desarrolladora frontend',
        profilePicture: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=2D8659&color=fff',
        ciudad: 'Bogotá',
        especialidad: 'Diseño Gráfico Digital',
        sobreMi: 'Apasionada por el diseño y la experiencia del usuario. Especializada en UI/UX.'
    },
    {
        id: 'user-003',
        tipoDocumento: 'TI',
        numeroDocumento: '98765432',
        password: 'sena123',
        nombre: 'Carlos López',
        email: 'carlos.lopez@sena.edu.co',
        bio: 'Especialista en bases de datos y análisis',
        profilePicture: 'https://ui-avatars.com/api/?name=Carlos+Lopez&background=2D8659&color=fff',
        ciudad: 'Cali',
        especialidad: 'Análisis y Desarrollo de Sistemas de Información',
        sobreMi: 'Ingeniero apasionado por los datos. Experiencia en SQL, Python y análisis estadístico.'
    },
    {
        id: 'user-004',
        tipoDocumento: 'CE',
        numeroDocumento: '123456',
        password: 'sena123',
        nombre: 'Ana Martínez',
        email: 'ana.martinez@sena.edu.co',
        bio: 'Especialista en marketing digital y redes sociales',
        profilePicture: 'https://ui-avatars.com/api/?name=Ana+Martinez&background=2D8659&color=fff',
        ciudad: 'Barranquilla',
        especialidad: 'Marketing Digital',
        sobreMi: 'Community manager y especialista en marketing digital. Experta en redes sociales y contenido.'
    }
];

/**
 * Encuentra un usuario por tipo de documento y número
 * @param {string} tipoDoc - Tipo de documento (CC, TI, CE)
 * @param {string} numero - Número de documento
 * @returns {Object|null} Usuario encontrado o null
 */
export function findUserByDocument(tipoDoc, numero) {
    return MOCK_USERS.find(
        user => user.tipoDocumento === tipoDoc && user.numeroDocumento === numero
    );
}

/**
 * Valida credenciales de un usuario
 * Retorna el usuario sin la contraseña si es válido
 * @param {string} tipoDoc - Tipo de documento
 * @param {string} numero - Número de documento
 * @param {string} password - Contraseña
 * @returns {Object|null} Usuario autenticado sin password, o null si falla
 */
export function validateCredentials(tipoDoc, numero, password) {
    const user = findUserByDocument(tipoDoc, numero);
    
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
