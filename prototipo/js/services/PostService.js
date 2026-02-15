/**
 * PostService - Gestor centralizado de publicaciones con Firebase
 * 
 * Responsabilidades:
 * - CRUD de publicaciones en Firestore
 * - Sincronización en tiempo real con onSnapshot
 * - Validaciones de negocio
 * - Gestión de likes/comentarios
 * - Subida de imágenes a Storage
 * 
 * Estructura Firestore:
 * posts/{postId}
 *   - userId: string
 *   - content: string
 *   - imageUrl: string | null
 *   - votes: { upvotes: number, downvotes: number, usersVoted: {userId: 'up'|'down'} }
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 */

// ...existing code...
import { isValidText, isValidImageFile } from '../utils.js';
import { userService } from './UserService.js';
import { commentService } from './CommentService.js';

class PostService {
    constructor() {
        this.activeListeners = new Map();
    }

    // Lógica de frontend para posts (sin backend)
    // TODO: Implementar almacenamiento local o mock para posts

    async createPost(content, imageFile = null) {
        try {
            const user = this._getCurrentUser();
            if (!user) {
                throw new Error('Debes iniciar sesión para publicar');
            }

            // Validaciones
            if (!isValidText(content) && !imageFile) {
                throw new Error('Debes escribir algo o seleccionar una imagen');
            }

            let imageUrl = null;
            // ⚠️ STORAGE DESHABILITADO TEMPORALMENTE
            // Para habilitar Storage, actualiza Firebase a plan Blaze (gratuito con límites)
            if (imageFile) {
                console.warn('⚠️ Subida de imágenes deshabilitada. Activa Firebase Storage para usar esta función.');
                // Ignorar imagen por ahora
                imageUrl = null;
            }
            /* CÓDIGO ORIGINAL (descomentar cuando actives Storage):
            if (imageFile) {
                if (!this._isValidImageFile(imageFile)) {
                    throw new Error('Imagen inválida o demasiado grande (máx 5MB)');
                }

                const timestamp = Date.now();
                const fileName = `${timestamp}_${imageFile.name}`;
                const storageRef = ref(storage, `post-images/${user.uid}/${fileName}`);
                
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }
            */

            // Crear post en Firestore
            const postData = {
                userId: user.uid,
                content: content.trim(),
                imageUrl,
                votes: {
                    upvotes: 0,
                    downvotes: 0,
                    usersVoted: {}
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'posts'), postData);

            return {
                success: true,
                postId: docRef.id,
                message: 'Publicación creada exitosamente'
            };
        } catch (error) {
            console.error('Error creating post:', error);
            return {
                success: false,
                error: error.message,
                postId: null
            };
        }
    }

    /**
     * Escucha cambios en posts en tiempo real
     * @param {Function} callback - (error, posts) => void
     * @returns {Function} unsubscribe function
     */
    listenToPosts(callback) {
        try {
            const postsQuery = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(
                postsQuery,
                (snapshot) => {
                    const posts = [];
                    snapshot.forEach((doc) => {
                        posts.push({
                            id: doc.id,
                            ...doc.data(),
                            // Convertir timestamps a Date
                            createdAt: doc.data().createdAt?.toDate(),
                            updatedAt: doc.data().updatedAt?.toDate()
                        });
                    });
                    callback(null, posts);
                },
                (error) => {
                    console.error('Error listening to posts:', error);
                    callback(error, []);
                }
            );

            // Guardar listener
            const listenerId = 'posts_all';
            this.activeListeners.set(listenerId, unsubscribe);

            return unsubscribe;
        } catch (error) {
            console.error('Error setting up posts listener:', error);
            callback(error, []);
            return () => {};
        }
    }

    /**
     * Obtiene todas las publicaciones (sin listener)
     * @returns {Promise<Array>}
     */
    async getPosts() {
        try {
            const postsQuery = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(postsQuery);
            
            const posts = [];
            snapshot.forEach((doc) => {
                posts.push({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    updatedAt: doc.data().updatedAt?.toDate()
                });
            });

            return posts;
        } catch (error) {
            console.error('Error getting posts:', error);
            return [];
        }
    }

    /**
     * Obtiene una publicación por ID
     * @param {string} postId - ID del post
     * @returns {Promise<Object|null>}
     */
    async getPostById(postId) {
        try {
            const docRef = doc(db, 'posts', postId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate(),
                updatedAt: docSnap.data().updatedAt?.toDate()
            };
        } catch (error) {
            console.error('Error getting post:', error);
            return null;
        }
    }

    /**
     * Obtiene posts de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>}
     */
    async getPostsByUserId(userId) {
        try {
            const postsQuery = query(
                collection(db, 'posts'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(postsQuery);
            
            const posts = [];
            snapshot.forEach((doc) => {
                posts.push({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    updatedAt: doc.data().updatedAt?.toDate()
                });
            });

            return posts;
        } catch (error) {
            console.error('Error getting user posts:', error);
            return [];
        }
    }

    /**
     * Obtiene posts de un usuario con información enriquecida
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} Posts con autor
     */
    async getUserPosts(userId) {
        try {
            const posts = await this.getPostsByUserId(userId);
            
            // Enriquecer cada post con info del autor
            const enrichedPosts = await Promise.all(
                posts.map(async (post) => ({
                    ...post,
                    author: await userService.getUserById(post.userId) || {},
                    commentCount: commentService.getCommentCount(post.id)
                }))
            );
            
            return enrichedPosts;
        } catch (error) {
            console.error('Error getting user posts:', error);
            return [];
        }
    }

    /**
     * Actualiza una publicación
     * @param {string} postId - ID del post
     * @param {string} newContent - Nuevo contenido
     * @returns {Promise<Object>}
     */
    async updatePost(postId, newContent) {
        try {
            const user = this._getCurrentUser();
            if (!user) {
                throw new Error('Debes iniciar sesión');
            }

            const post = await this.getPostById(postId);
            if (!post) {
                throw new Error('Publicación no encontrada');
            }

            if (post.userId !== user.uid) {
                throw new Error('No tienes permiso para editar esta publicación');
            }

            if (!isValidText(newContent)) {
                throw new Error('El contenido no puede estar vacío');
            }

            const docRef = doc(db, 'posts', postId);
            await updateDoc(docRef, {
                content: newContent.trim(),
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                message: 'Publicación actualizada'
            };
        } catch (error) {
            console.error('Error updating post:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Elimina una publicación
     * @param {string} postId - ID del post
     * @returns {Promise<Object>}
     */
    async deletePost(postId) {
        try {
            const user = this._getCurrentUser();
            if (!user) {
                throw new Error('Debes iniciar sesión');
            }

            const post = await this.getPostById(postId);
            if (!post) {
                throw new Error('Publicación no encontrada');
            }

            if (post.userId !== user.uid) {
                throw new Error('No tienes permiso para eliminar esta publicación');
            }

            const docRef = doc(db, 'posts', postId);
            await deleteDoc(docRef);

            return {
                success: true,
                message: 'Publicación eliminada'
            };
        } catch (error) {
            console.error('Error deleting post:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene post con detalles (autor incluido)
     * @param {string} postId - ID del post
     * @returns {Promise<Object|null>}
     */
    async getPostWithDetails(postId) {
        try {
            const post = await this.getPostById(postId);
            if (!post) return null;

            const author = await userService.getUserById(post.userId);

            return {
                ...post,
                author,
                commentCount: commentService.getCommentCount(postId)
            };
        } catch (error) {
            console.error('Error getting post details:', error);
            return null;
        }
    }

    /**
     * Obtiene posts del feed
     * @param {Object} options - Opciones de filtrado  
     * @returns {Promise<Array>}
     */
    async getFeed(options = {}) {
        try {
            const posts = await this.getPosts();

            // Enriquecer cada post con info del autor
            const enrichedPosts = await Promise.all(
                posts.map(async (post) => ({
                    ...post,
                    author: await userService.getUserById(post.userId) || {},
                    commentCount: commentService.getCommentCount(post.id)
                }))
            );

            return enrichedPosts;
        } catch (error) {
            console.error('Error getting feed:', error);
            return [];
        }
    }

    /**
     * Verifica si el usuario puede realizar una acción
     * @param {string} postId - ID del post
     * @param {string} action - 'edit' o 'delete'
     * @returns {Promise<boolean>}
     */
    async canUserPerformAction(postId, action = 'delete') {
        try {
            const user = this._getCurrentUser();
            if (!user) return false;

            const post = await this.getPostById(postId);
            if (!post) return false;

            return post.userId === user.uid;
        } catch (error) {
            return false;
        }
    }

    /**
     * Alterna voto positivo en un post
     * @param {string} postId - ID del post
     * @returns {Promise<Object>}
     */
    async toggleUpvote(postId) {
        try {
            const user = this._getCurrentUser();
            if (!user) {
                throw new Error('Debes iniciar sesión para votar');
            }

            const post = await this.getPostById(postId);
            if (!post) {
                throw new Error('Publicación no encontrada');
            }

            const currentVote = post.votes.usersVoted[user.uid];
            const docRef = doc(db, 'posts', postId);

            if (currentVote === 'up') {
                // Remover upvote
                await updateDoc(docRef, {
                    'votes.upvotes': increment(-1),
                    [`votes.usersVoted.${user.uid}`]: null
                });
            } else if (currentVote === 'down') {
                // Cambiar de down a up
                await updateDoc(docRef, {
                    'votes.upvotes': increment(1),
                    'votes.downvotes': increment(-1),
                    [`votes.usersVoted.${user.uid}`]: 'up'
                });
            } else {
                // Agregar upvote
                await updateDoc(docRef, {
                    'votes.upvotes': increment(1),
                    [`votes.usersVoted.${user.uid}`]: 'up'
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error toggling upvote:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Alterna voto negativo en un post
     * @param {string} postId - ID del post
     * @returns {Promise<Object>}
     */
    async toggleDownvote(postId) {
        try {
            const user = this._getCurrentUser();
            if (!user) {
                throw new Error('Debes iniciar sesión para votar');
            }

            const post = await this.getPostById(postId);
            if (!post) {
                throw new Error('Publicación no encontrada');
            }

            const currentVote = post.votes.usersVoted[user.uid];
            const docRef = doc(db, 'posts', postId);

            if (currentVote === 'down') {
                // Remover downvote
                await updateDoc(docRef, {
                    'votes.downvotes': increment(-1),
                    [`votes.usersVoted.${user.uid}`]: null
                });
            } else if (currentVote === 'up') {
                // Cambiar de up a down
                await updateDoc(docRef, {
                    'votes.upvotes': increment(-1),
                    'votes.downvotes': increment(1),
                    [`votes.usersVoted.${user.uid}`]: 'down'
                });
            } else {
                // Agregar downvote
                await updateDoc(docRef, {
                    'votes.downvotes': increment(1),
                    [`votes.usersVoted.${user.uid}`]: 'down'
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error toggling downvote:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene el voto actual del usuario
     * @param {string} postId - ID del post
     * @returns {Promise<string|null>} 'up', 'down' o null
     */
    async getUserVote(postId) {
        try {
            const user = this._getCurrentUser();
            if (!user) return null;

            const post = await this.getPostById(postId);
            if (!post || !post.votes) return null;

            return post.votes.usersVoted[user.uid] || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Obtiene balance de votos
     * @param {string} postId - ID del post
     * @returns {Promise<number>}
     */
    async getVoteBalance(postId) {
        try {
            const post = await this.getPostById(postId);
            if (!post || !post.votes) return 0;
            return post.votes.upvotes - post.votes.downvotes;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Obtiene posts filtrados
     * @param {Object} filters - { centro, regional, etapa, modalidad }
     * @returns {Promise<Array>}
     */
    async getFilteredPosts(filters = {}) {
        try {
            const allPosts = await this.getPosts();
            
            // Si no hay filtros, retornar todos
            if (!filters.centro && !filters.regional && !filters.etapa && !filters.modalidad) {
                return await Promise.all(
                    allPosts.map(async (post) => ({
                        ...post,
                        author: await userService.getUserById(post.userId) || {},
                        commentCount: commentService.getCommentCount(post.id)
                    }))
                );
            }
            
            // Aplicar filtros
            const filtered = await Promise.all(
                allPosts.map(async (post) => {
                    const author = await userService.getUserById(post.userId);
                    if (!author) return null;
                    
                    if (filters.centro && author.centro !== filters.centro) return null;
                    if (filters.regional && author.regional !== filters.regional) return null;
                    if (filters.etapa && author.etapa !== filters.etapa) return null;
                    if (filters.modalidad && author.modalidad !== filters.modalidad) return null;
                    
                    return {
                        ...post,
                        author,
                        commentCount: commentService.getCommentCount(post.id)
                    };
                })
            );
            
            return filtered.filter(post => post !== null);
        } catch (error) {
            console.error('Error filtering posts:', error);
            return [];
        }
    }

    /**
     * Limpia todos los listeners activos
     */
    cleanup() {
        this.activeListeners.forEach((unsubscribe) => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.activeListeners.clear();
    }
}

export const postService = new PostService();
