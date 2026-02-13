/**
 * DataMapper - Adaptadores de datos centralizados
 * 
 * Mapea datos entre diferentes formatos:
 * - De localStorage a modelo interno
 * - De API REST a modelo interno
 * - De modelo interno a API REST
 * 
 * Cuando se integre un backend, solo se modifican estos mappers,
 * el resto de la aplicación permanece sin cambios.
 */

class DataMapper {
    /**
     * Mapea datos de usuario de cualquier fuente al modelo interno
     * @param {Object} data - Datos crudos (de API, localStorage, etc)
     * @param {string} source - Fuente: 'api', 'localStorage', 'mock'
     * @returns {Object} - Usuario en formato del modelo interno
     */
    mapUser(data, source = 'mock') {
        // Modelo interno estándar de usuario
        const user = {
            id: null,
            tipoDoc: null,
            documento: null,
            nombre: null,
            apodo: null,
            trimestre: null,
            programa: null,
            profilePicture: null,
            bio: null,
            email: null,
            rol: null,
            ciudad: null,
            regional: null,
            centro: null,
            etapa: null,
            modalidad: null,
            isLoggedIn: false
        };

        switch (source) {
            case 'api':
                // Mapeo desde API REST (formato futuro)
                return {
                    id: data.id || data.user_id,
                    tipoDoc: data.documentType || data.tipo_documento,
                    documento: data.documentNumber || data.numero_documento,
                    nombre: data.fullName || data.nombre_completo,
                    apodo: data.nickname || data.apodo,
                    trimestre: data.quarter || data.trimestre,
                    programa: data.program || data.programa,
                    profilePicture: data.avatarUrl || data.profile_picture || 'assets/placeholders/avatar-placeholder.svg',
                    bio: data.biography || data.bio || '',
                    email: data.email || data.correo,
                    rol: data.rol || data.role || '',
                    ciudad: data.ciudad || data.city || '',
                    regional: data.regional || data.regional_center || '',
                    centro: data.centro || data.center || '',
                    etapa: data.etapa || data.stage || '',
                    modalidad: data.modalidad || data.modality || '',
                    isLoggedIn: data.isLoggedIn !== undefined ? data.isLoggedIn : false
                };

            case 'localStorage':
                // Mapeo desde localStorage (formato actual)
                return {
                    id: data.id,
                    tipoDoc: data.tipoDoc,
                    documento: data.documento,
                    nombre: data.nombre,
                    apodo: data.apodo,
                    trimestre: data.trimestre,
                    programa: data.programa,
                    profilePicture: data.profilePicture || 'assets/placeholders/avatar-placeholder.svg',
                    bio: data.bio || '',
                    email: data.email,
                    rol: data.rol || '',
                    ciudad: data.ciudad || '',
                    regional: data.regional || '',
                    centro: data.centro || '',
                    etapa: data.etapa || '',
                    modalidad: data.modalidad || '',
                    isLoggedIn: data.isLoggedIn || false
                };

            case 'mock':
            default:
                // Mapeo desde MockUsers (formato actual)
                return {
                    id: data.id,
                    tipoDoc: data.tipoDoc,
                    documento: data.documento,
                    nombre: data.nombre,
                    apodo: data.apodo,
                    trimestre: data.trimestre,
                    programa: data.programa,
                    profilePicture: data.profilePicture || 'assets/placeholders/avatar-placeholder.svg',
                    bio: data.bio || '',
                    email: data.email,
                    rol: data.rol || '',
                    ciudad: data.ciudad || '',
                    regional: data.regional || '',
                    centro: data.centro || '',
                    etapa: data.etapa || '',
                    modalidad: data.modalidad || '',
                    isLoggedIn: data.isLoggedIn || false
                };
        }
    }

    /**
     * Mapea usuario interno a formato de API para envío
     * @param {Object} user - Usuario en formato interno
     * @returns {Object} - Usuario en formato API
     */
    mapUserToAPI(user) {
        return {
            user_id: user.id,
            tipo_documento: user.tipoDoc,
            numero_documento: user.documento,
            nombre_completo: user.nombre,
            apodo: user.apodo,
            trimestre: user.trimestre,
            programa: user.programa,
            profile_picture: user.profilePicture,
            bio: user.bio,
            correo: user.email
        };
    }

    /**
     * Mapea publicación de cualquier fuente al modelo interno
     * @param {Object} data - Datos crudos
     * @param {string} source - Fuente de datos
     * @returns {Object} - Publicación en formato interno
     */
    mapPost(data, source = 'localStorage') {
        const post = {
            id: null,
            userId: null,
            author: null,
            content: null,
            imageUrl: null,
            timestamp: null,
            likes: 0,
            comments: []
        };

        switch (source) {
            case 'api':
                return {
                    id: data.id || data.post_id,
                    userId: data.userId || data.user_id,
                    author: data.author ? this.mapUser(data.author, 'api') : null,
                    content: data.content || data.contenido,
                    imageUrl: data.imageUrl || data.imagen_url,
                    timestamp: data.createdAt || data.created_at || data.timestamp,
                    likes: data.likesCount || data.likes || 0,
                    comments: (data.comments || []).map(c => this.mapComment(c, 'api'))
                };

            case 'localStorage':
            default:
                return {
                    id: data.id,
                    userId: data.userId,
                    author: data.author,
                    content: data.content,
                    imageUrl: data.imageUrl,
                    timestamp: data.timestamp,
                    likes: data.likes || 0,
                    comments: data.comments || []
                };
        }
    }

    /**
     * Mapea publicación interna a formato API
     * @param {Object} post - Publicación en formato interno
     * @returns {Object} - Publicación en formato API
     */
    mapPostToAPI(post) {
        return {
            post_id: post.id,
            user_id: post.userId,
            contenido: post.content,
            imagen_url: post.imageUrl,
            created_at: post.timestamp
        };
    }

    /**
     * Mapea comentario de cualquier fuente al modelo interno
     * @param {Object} data - Datos crudos
     * @param {string} source - Fuente de datos
     * @returns {Object} - Comentario en formato interno
     */
    mapComment(data, source = 'localStorage') {
        switch (source) {
            case 'api':
                return {
                    id: data.id || data.comment_id,
                    postId: data.postId || data.post_id,
                    userId: data.userId || data.user_id,
                    author: data.author ? this.mapUser(data.author, 'api') : null,
                    content: data.content || data.contenido,
                    imageUrl: data.imageUrl || data.imagen_url,
                    timestamp: data.createdAt || data.created_at || data.timestamp
                };

            case 'localStorage':
            default:
                return {
                    id: data.id,
                    postId: data.postId,
                    userId: data.userId,
                    author: data.author,
                    content: data.content,
                    imageUrl: data.imageUrl,
                    timestamp: data.timestamp
                };
        }
    }

    /**
     * Mapea comentario interno a formato API
     * @param {Object} comment - Comentario en formato interno
     * @returns {Object} - Comentario en formato API
     */
    mapCommentToAPI(comment) {
        return {
            comment_id: comment.id,
            post_id: comment.postId,
            user_id: comment.userId,
            contenido: comment.content,
            imagen_url: comment.imageUrl,
            created_at: comment.timestamp
        };
    }

    /**
     * Mapea conversación/chat de cualquier fuente al modelo interno
     * @param {Object} data - Datos crudos
     * @param {string} source - Fuente de datos
     * @returns {Object} - Chat en formato interno
     */
    mapChat(data, source = 'localStorage') {
        switch (source) {
            case 'api':
                return {
                    id: data.id || data.chat_id,
                    participants: (data.participants || []).map(p => this.mapUser(p, 'api')),
                    lastMessage: data.lastMessage ? this.mapMessage(data.lastMessage, 'api') : null,
                    updatedAt: data.updatedAt || data.updated_at,
                    unreadCount: data.unreadCount || data.unread_count || 0
                };

            case 'localStorage':
            default:
                return {
                    id: data.id,
                    participants: data.participants || [],
                    lastMessage: data.lastMessage || null,
                    updatedAt: data.updatedAt,
                    unreadCount: data.unreadCount || 0
                };
        }
    }

    /**
     * Mapea mensaje de cualquier fuente al modelo interno
     * @param {Object} data - Datos crudos
     * @param {string} source - Fuente de datos
     * @returns {Object} - Mensaje en formato interno
     */
    mapMessage(data, source = 'localStorage') {
        switch (source) {
            case 'api':
                return {
                    id: data.id || data.message_id,
                    chatId: data.chatId || data.chat_id,
                    senderId: data.senderId || data.sender_id,
                    content: data.content || data.contenido,
                    imageUrl: data.imageUrl || data.imagen_url,
                    timestamp: data.createdAt || data.created_at || data.timestamp,
                    read: data.read || data.leido || false
                };

            case 'localStorage':
            default:
                return {
                    id: data.id,
                    chatId: data.chatId,
                    senderId: data.senderId,
                    content: data.content,
                    imageUrl: data.imageUrl,
                    timestamp: data.timestamp,
                    read: data.read || false
                };
        }
    }

    /**
     * Mapea respuesta de API genérica
     * @param {Object} response - Respuesta de API
     * @returns {Object} - Respuesta normalizada
     */
    mapAPIResponse(response) {
        return {
            success: response.success !== undefined ? response.success : true,
            data: response.data || response.result || response,
            message: response.message || null,
            error: response.error || null,
            metadata: {
                timestamp: response.timestamp || new Date().toISOString(),
                pagination: response.pagination || null,
                total: response.total || null
            }
        };
    }

    /**
     * Mapea múltiples items usando el mapper correspondiente
     * @param {Array} items - Array de items a mapear
     * @param {string} type - Tipo: 'user', 'post', 'comment', 'chat', 'message'
     * @param {string} source - Fuente de datos
     * @returns {Array} - Array de items mapeados
     */
    mapCollection(items, type, source = 'localStorage') {
        if (!Array.isArray(items)) return [];

        const mapperMap = {
            user: this.mapUser.bind(this),
            post: this.mapPost.bind(this),
            comment: this.mapComment.bind(this),
            chat: this.mapChat.bind(this),
            message: this.mapMessage.bind(this)
        };

        const mapper = mapperMap[type];
        if (!mapper) {
            // Tipo no reconocido - devolver items sin mapear
            return items;
        }

        return items.map(item => mapper(item, source));
    }
}

export const dataMapper = new DataMapper();
