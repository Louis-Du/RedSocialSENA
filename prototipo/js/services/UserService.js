/**
 * UserService - Autenticación con Firebase
 * 
 * Sistema simplificado de autenticación usando Firebase Auth + Firestore
 */

import { auth, db } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class UserService {
    constructor() {
        this.currentUserData = null;
        this.authInitialized = false;
        this.setupAuthListener();
    }

    /**
     * Configura listener de cambios de autenticación
     */
    setupAuthListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Usuario autenticado - cargar datos de Firestore
                const userData = await this.getUserById(user.uid);
                this.currentUserData = userData;
                this.authInitialized = true;
            } else {
                // Usuario no autenticado
                this.currentUserData = null;
                this.authInitialized = true;
            }
        });
    }

    /**
     * Convierte documento a email sintético
     */
    _documentoToEmail(tipoDoc, documento) {
        return `${tipoDoc}_${documento}@redsocialsena.local`.toLowerCase();
    }

    /**
     * Login con Firebase Auth
     */
    async login(tipoDoc, documento, password) {
        try {
            const email = this._documentoToEmail(tipoDoc, documento);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            const userData = await this.getUserById(userCredential.user.uid);
            this.currentUserData = userData;

            return {
                success: true,
                user: userData,
                message: 'Bienvenido(a)'
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Credenciales incorrectas',
                user: null
            };
        }
    }

    /**
     * Registro con Firebase Auth + Firestore
     */
    async register(userData) {
        try {
            const { tipoDoc, documento, password, nombre, rol, programa, ciudad } = userData;

            const email = this._documentoToEmail(tipoDoc, documento);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            const userProfile = {
                tipoDoc,
                documento,
                nombre,
                apodo: nombre.split(' ')[0],
                rol: rol || 'Aprendiz',
                email: userData.email || `${documento}@sena.edu.co`,
                programa: programa || 'No especificado',
                ciudad: ciudad || 'No especificado',
                bio: `${rol || 'Aprendiz'} del SENA`,
                profilePicture: null,
                trimestre: '1° Trimestre',
                regional: 'Centro SENA',
                centro: ciudad || 'No especificado',
                etapa: 'Lectiva',
                modalidad: 'Presencial',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'users', uid), userProfile);

            const newUser = await this.getUserById(uid);
            this.currentUserData = newUser;

            return {
                success: true,
                user: newUser,
                message: 'Cuenta creada exitosamente'
            };
        } catch (error) {
            console.error('Register error:', error);
            
            let errorMessage = 'Error al crear la cuenta';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Ya existe una cuenta con este documento';
            }
            
            return {
                success: false,
                error: errorMessage,
                user: null
            };
        }
    }

    /**
     * Logout
     */
    async logout() {
        try {
            await signOut(auth);
            this.currentUserData = null;
            return { success: true, message: 'Sesión cerrada' };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene usuario actual
     */
    getCurrentUser() {
        if (!auth.currentUser) {
            return { id: null, isLoggedIn: false };
        }
        
        return {
            id: auth.currentUser.uid,
            ...this.currentUserData,
            isLoggedIn: true
        };
    }

    /**
     * Verifica si hay sesión activa
     */
    isLoggedIn() {
        return auth.currentUser !== null;
    }

    /**
     * Obtiene usuario por ID desde Firestore
     */
    async getUserById(userId) {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: userId,
                ...docSnap.data(),
                isLoggedIn: userId === auth.currentUser?.uid
            };
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    /**
     * Actualiza perfil
     */
    async updateProfile(updates) {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('No autenticado');
            }

            const docRef = doc(db, 'users', userId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });

            const updatedUser = await this.getUserById(userId);
            this.currentUserData = updatedUser;

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

    /**
     * Métodos de compatibilidad
     */
    canEditPost(post) {
        return post.userId === auth.currentUser?.uid;
    }

    canDeletePost(post) {
        return this.canEditPost(post);
    }

    canDeleteComment(comment) {
        return comment.userId === auth.currentUser?.uid;
    }

    getUserPosts(userId) {
        // Implementación pendiente (usará PostService)
        return [];
    }

    getUsers() {
        // Implementación pendiente (requerirá query a Firestore)
        return [];
    }
}

export const userService = new UserService();
