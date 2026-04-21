import { userState } from './authState.js';

const STORAGE_KEYS = {
    users: 'redSocialSena.users.v1',
    session: 'redSocialSena.session.v1'
};

const DEFAULT_PASSWORD = 'sena123';

const DEFAULT_USERS = [
    {
        id: 'user_1',
        uid: 'user_1',
        tipoDoc: 'CC',
        documento: '1234567890',
        password: DEFAULT_PASSWORD,
        nombre: 'Daniel Esteban',
        apodo: 'Daniel Esteban',
        rol: 'Aprendiz',
        email: 'daniel.esteban@sena.edu.co',
        programa: 'Tecnologo en Analisis y Desarrollo de Software',
        ciudad: 'Barrancabermeja',
        bio: 'Aprendiz apasionado por la tecnologia',
        profilePicture: 'assets/placeholders/avatar-placeholder.svg',
        trimestre: '3 Trimestre',
        regional: 'Centro para la Industria Petroquimica',
        centro: 'Barrancabermeja',
        etapa: 'Lectiva',
        modalidad: 'Presencial'
    },
    {
        id: 'user_2',
        uid: 'user_2',
        tipoDoc: 'CC',
        documento: '9876543210',
        password: DEFAULT_PASSWORD,
        nombre: 'Maria Garcia',
        apodo: 'Maria',
        rol: 'Aprendiz',
        email: 'maria.garcia@sena.edu.co',
        programa: 'Tecnica en Administracion de Sistemas',
        ciudad: 'Bogota',
        bio: 'Especialista en redes',
        profilePicture: 'assets/placeholders/avatar-placeholder.svg',
        trimestre: '2 Trimestre',
        regional: 'Centro de Gestion Administrativa',
        centro: 'Bogota',
        etapa: 'Lectiva',
        modalidad: 'Virtual'
    },
    {
        id: 'user_3',
        uid: 'user_3',
        tipoDoc: 'CC',
        documento: '5555555555',
        password: DEFAULT_PASSWORD,
        nombre: 'Carlos Lopez',
        apodo: 'Carlos',
        rol: 'Aprendiz',
        email: 'carlos.lopez@sena.edu.co',
        programa: 'Tecnica en Programacion',
        ciudad: 'Cali',
        bio: 'Frontend developer en formacion',
        profilePicture: 'assets/placeholders/avatar-placeholder.svg',
        trimestre: '1 Trimestre',
        regional: 'Centro de Tecnologias de la Informacion',
        centro: 'Cali',
        etapa: 'Lectiva',
        modalidad: 'Presencial'
    },
    {
        id: 'user_4',
        uid: 'user_4',
        tipoDoc: 'TI',
        documento: '11223344',
        password: DEFAULT_PASSWORD,
        nombre: 'Ana Martinez',
        apodo: 'Ana',
        rol: 'Egresado',
        email: 'ana.martinez@sena.edu.co',
        programa: 'Marketing Digital',
        ciudad: 'Barranquilla',
        bio: 'Especialista en marketing digital y redes sociales',
        profilePicture: 'assets/placeholders/avatar-placeholder.svg',
        trimestre: '4 Trimestre',
        regional: 'Centro de Comercio y Servicios',
        centro: 'Barranquilla',
        etapa: 'Productiva',
        modalidad: 'Mixta'
    }
];

class UserLocal {
    constructor() {
        this.initialized = false;
        this._seed();
    }

    _getStorage() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }

        return window.localStorage;
    }

    _normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    _sanitizeUser(user) {
        if (!user) return null;

        const { password, ...safeUser } = user;
        return {
            ...safeUser,
            id: safeUser.id || safeUser.uid,
            uid: safeUser.uid || safeUser.id
        };
    }

    _loadUsers() {
        const storage = this._getStorage();
        if (!storage) {
            return DEFAULT_USERS.map(user => ({ ...user }));
        }

        const rawUsers = storage.getItem(STORAGE_KEYS.users);
        if (!rawUsers) {
            const seededUsers = DEFAULT_USERS.map(user => ({ ...user }));
            storage.setItem(STORAGE_KEYS.users, JSON.stringify(seededUsers));
            return seededUsers;
        }

        try {
            const parsed = JSON.parse(rawUsers);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                throw new Error('Invalid users storage');
            }

            return parsed.map(user => ({ ...user }));
        } catch (_error) {
            const fallbackUsers = DEFAULT_USERS.map(user => ({ ...user }));
            storage.setItem(STORAGE_KEYS.users, JSON.stringify(fallbackUsers));
            return fallbackUsers;
        }
    }

    _saveUsers(users) {
        const storage = this._getStorage();
        if (!storage) return;
        storage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    }

    _saveSession(currentUser) {
        const storage = this._getStorage();
        if (!storage) return;

        if (!currentUser?.uid) {
            storage.removeItem(STORAGE_KEYS.session);
            return;
        }

        storage.setItem(STORAGE_KEYS.session, JSON.stringify({ uid: currentUser.uid }));
    }

    _restoreSession(users) {
        const storage = this._getStorage();
        if (!storage) return null;

        const rawSession = storage.getItem(STORAGE_KEYS.session);
        if (!rawSession) return null;

        try {
            const parsedSession = JSON.parse(rawSession);
            const uid = String(parsedSession?.uid || '').trim();
            if (!uid) {
                storage.removeItem(STORAGE_KEYS.session);
                return null;
            }

            const user = users.find(candidate => candidate.uid === uid || candidate.id === uid);
            if (!user) {
                storage.removeItem(STORAGE_KEYS.session);
                return null;
            }

            return this._sanitizeUser(user);
        } catch (_error) {
            storage.removeItem(STORAGE_KEYS.session);
            return null;
        }
    }

    _seed() {
        const users = this._loadUsers();
        const currentUser = this._restoreSession(users);

        userState.setUsers(users);
        userState.setCurrentUser(currentUser);

        this.initialized = true;
        return userState.snapshot();
    }

    async initialize() {
        if (!this.initialized) {
            return this._seed();
        }

        return userState.snapshot();
    }

    async login(tipoDoc, documento, password) {
        await this.initialize();

        const normalizedTipoDoc = String(tipoDoc || '').trim().toUpperCase();
        const normalizedDocumento = this._normalize(documento);
        const users = userState.getUsers();

        const user = users.find(candidate => {
            const isSameDocType = String(candidate.tipoDoc || '').toUpperCase() === normalizedTipoDoc;
            const isSameDocument = this._normalize(candidate.documento) === normalizedDocumento;
            return isSameDocType && isSameDocument;
        });

        if (!user) {
            return { success: false, user: null, error: 'Usuario no encontrado' };
        }

        if (String(user.password) !== String(password)) {
            return { success: false, user: null, error: 'Credenciales invalidas' };
        }

        const safeUser = this._sanitizeUser(user);
        userState.setCurrentUser(safeUser);
        this._saveSession(safeUser);

        return {
            success: true,
            user: safeUser,
            message: 'Bienvenido(a) (demo)'
        };
    }

    async register(userData) {
        await this.initialize();

        try {
            const { tipoDoc, documento, password, nombre, rol, programa, ciudad } = userData;

            const normalizedTipoDoc = String(tipoDoc || '').trim().toUpperCase();
            const normalizedDocumento = this._normalize(documento);

            if (!normalizedTipoDoc || !normalizedDocumento || !password || !nombre) {
                return {
                    success: false,
                    error: 'Todos los campos obligatorios deben estar completos',
                    user: null
                };
            }

            const users = userState.getUsers();
            const userAlreadyExists = users.some(candidate => {
                const isSameDocType = String(candidate.tipoDoc || '').toUpperCase() === normalizedTipoDoc;
                const isSameDocument = this._normalize(candidate.documento) === normalizedDocumento;
                return isSameDocType && isSameDocument;
            });

            if (userAlreadyExists) {
                return {
                    success: false,
                    error: 'Ya existe una cuenta con este documento',
                    user: null
                };
            }

            const uid = `user_${Date.now()}`;
            const firstName = String(nombre).trim().split(' ')[0] || 'Usuario';

            const newUser = {
                id: uid,
                uid,
                tipoDoc: normalizedTipoDoc,
                documento: String(documento).trim(),
                password: String(password),
                nombre,
                apodo: firstName,
                rol: rol || 'Aprendiz',
                email: userData.email || `${documento}@sena.edu.co`,
                programa: programa || 'No especificado',
                ciudad: ciudad || 'No especificado',
                bio: `${rol || 'Aprendiz'} del SENA`,
                profilePicture: 'assets/placeholders/avatar-placeholder.svg',
                trimestre: '1 Trimestre',
                regional: 'Centro SENA',
                centro: ciudad || 'No especificado',
                etapa: 'Lectiva',
                modalidad: 'Presencial'
            };

            const nextUsers = [...users, newUser];
            userState.setUsers(nextUsers);
            this._saveUsers(nextUsers);

            const safeUser = this._sanitizeUser(newUser);
            userState.setCurrentUser(safeUser);
            this._saveSession(safeUser);

            return {
                success: true,
                user: safeUser,
                message: 'Cuenta creada exitosamente'
            };
        } catch (error) {
            console.error('Register error:', error);

            return {
                success: false,
                error: 'Error al crear la cuenta',
                user: null
            };
        }
    }

    async logout() {
        try {
            userState.setCurrentUser(null);
            this._saveSession(null);
            return { success: true, message: 'Sesión cerrada' };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProfile(updates) {
        try {
            const currentUser = userState.getCurrentUser();
            const userId = currentUser?.uid;
            if (!userId) {
                throw new Error('No autenticado');
            }

            const users = userState.getUsers();
            const userIndex = users.findIndex(candidate => (candidate.uid || candidate.id) === userId);
            if (userIndex === -1) {
                throw new Error('Usuario no encontrado');
            }

            const safeUpdates = { ...updates };
            delete safeUpdates.id;
            delete safeUpdates.uid;
            delete safeUpdates.password;
            delete safeUpdates.tipoDoc;
            delete safeUpdates.documento;

            const nextUsers = [...users];
            nextUsers[userIndex] = {
                ...nextUsers[userIndex],
                ...safeUpdates
            };

            userState.setUsers(nextUsers);
            this._saveUsers(nextUsers);

            const updatedUser = this.getUserById(userId);
            userState.setCurrentUser(updatedUser);

            return {
                success: true,
                user: updatedUser,
                message: 'Perfil actualizado'
            };
        } catch (error) {
            console.error('Update error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getCurrentUser() {
        const currentUser = userState.getCurrentUser();
        if (!currentUser) {
            return { id: null, uid: null, isLoggedIn: false };
        }

        return {
            id: currentUser.id || currentUser.uid,
            uid: currentUser.uid || currentUser.id,
            ...currentUser,
            isLoggedIn: true
        };
    }

    isLoggedIn() {
        return userState.getCurrentUser() !== null;
    }

    getUserById(userId) {
        const user = userState.getUserById(userId);
        if (!user) return null;

        return {
            ...this._sanitizeUser(user),
            isLoggedIn: String(userId || '').trim() === String(userState.getCurrentUser()?.uid || '')
        };
    }

    getUsers() {
        const currentUid = userState.getCurrentUser()?.uid;
        return userState
            .getUsers()
            .filter(user => (user.uid || user.id) !== currentUid)
            .map(user => this._sanitizeUser(user));
    }

    canEditPost(post) {
        if (!post?.userId) return false;
        return post.userId === userState.getCurrentUser()?.uid;
    }

    canDeletePost(post) {
        return this.canEditPost(post);
    }

    canDeleteComment(comment) {
        if (!comment?.userId) return false;
        return comment.userId === userState.getCurrentUser()?.uid;
    }

    getUserPosts() {
        return [];
    }

    subscribe(listener) {
        return userState.subscribe(listener);
    }
}

export const userLocal = new UserLocal();