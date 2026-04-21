import { postState } from './postState.js';
import { generateId, getFromStorage, saveToStorage, readFileAsDataURL } from '../../utils/utils.js';

const STORAGE_KEY = 'redSocialSena.posts.v1';

const DEFAULT_POSTS = [
    {
        id: 'post_seed_1',
        userId: 'user_1',
        content: 'Bienvenidos a la Red Social SENA. Este es un espacio para compartir aprendizaje y oportunidades.',
        imageUrl: null,
        votes: { upvotes: 0, downvotes: 0, usersVoted: {} },
        createdAt: '2026-04-21T00:00:00.000Z',
        updatedAt: '2026-04-21T00:00:00.000Z'
    },
    {
        id: 'post_seed_2',
        userId: 'user_2',
        content: 'Comparto material de apoyo para Análisis y Desarrollo de Software. Si lo necesitas, escríbeme por chat.',
        imageUrl: null,
        votes: { upvotes: 2, downvotes: 0, usersVoted: {} },
        createdAt: '2026-04-20T18:30:00.000Z',
        updatedAt: '2026-04-20T18:30:00.000Z'
    },
    {
        id: 'post_seed_3',
        userId: 'user_3',
        content: 'Recuerden revisar convocatorias activas y mantener su perfil actualizado para facilitar conexiones.',
        imageUrl: null,
        votes: { upvotes: 1, downvotes: 0, usersVoted: {} },
        createdAt: '2026-04-20T10:15:00.000Z',
        updatedAt: '2026-04-20T10:15:00.000Z'
    }
];

class PostLocal {
    constructor() {
        this.persistenceUnsubscribe = null;
        this.initialized = false;
    }

    _clonePosts(posts) {
        return posts.map(post => ({
            votes: { upvotes: 0, downvotes: 0, usersVoted: {}, ...(post.votes || {}) },
            imageUrl: post.imageUrl || null,
            ...post
        }));
    }

    _loadStoredPosts() {
        const stored = getFromStorage(STORAGE_KEY, null);
        if (Array.isArray(stored)) {
            return stored;
        }

        if (stored && Array.isArray(stored.posts)) {
            return stored.posts;
        }

        return null;
    }

    _persist(posts) {
        saveToStorage(STORAGE_KEY, posts);
    }

    async initialize() {
        if (!this.initialized) {
            const storedPosts = this._loadStoredPosts();
            const posts = this._clonePosts(storedPosts && storedPosts.length > 0 ? storedPosts : DEFAULT_POSTS);
            postState.setPosts(posts);

            if (this.persistenceUnsubscribe) {
                this.persistenceUnsubscribe();
            }

            this.persistenceUnsubscribe = postState.subscribe((snapshot) => {
                this._persist(snapshot);
            });

            this.initialized = true;
        }

        return postState.getPosts();
    }

    async getAll() {
        await this.initialize();
        return postState.getPosts();
    }

    async getById(postId) {
        await this.initialize();
        return postState.getPostById(postId);
    }

    async getByUserId(userId) {
        await this.initialize();
        return postState.getPosts().filter(post => post.userId === userId);
    }

    async create(postData) {
        await this.initialize();

        const now = new Date().toISOString();
        const post = {
            id: generateId(),
            userId: postData.userId,
            content: postData.content,
            imageUrl: null,
            votes: {
                upvotes: 0,
                downvotes: 0,
                usersVoted: {}
            },
            createdAt: now,
            updatedAt: now
        };

        if (postData.imageFile) {
            post.imageUrl = await readFileAsDataURL(postData.imageFile);
        } else if (postData.imageUrl) {
            post.imageUrl = postData.imageUrl;
        }

        postState.upsertPost(post);
        this._persist(postState.getPosts());

        return { ...post };
    }

    async update(postId, updates) {
        await this.initialize();

        const currentPost = postState.getPostById(postId);
        if (!currentPost) {
            return null;
        }

        const nextPost = {
            ...currentPost,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        postState.upsertPost(nextPost);
        this._persist(postState.getPosts());

        return { ...nextPost };
    }

    async delete(postId) {
        await this.initialize();
        const removed = postState.removePost(postId);
        if (removed) {
            this._persist(postState.getPosts());
        }
        return removed;
    }

    subscribe(listener) {
        return postState.subscribe(listener);
    }
}

export const postLocal = new PostLocal();