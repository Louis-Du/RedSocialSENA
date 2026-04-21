import { postState } from './postState.js';
import { postFirebase } from './postFirebase.js';
import { postLocal } from './postLocal.js';

class PostRepository {
    constructor() {
        this.activeSource = null;
    }

    _getSource() {
        return postFirebase.isAvailable() ? postFirebase : postLocal;
    }

    async initialize() {
        const source = this._getSource();

        if (this.activeSource && this.activeSource !== source && typeof this.activeSource.cleanup === 'function') {
            this.activeSource.cleanup();
        }

        this.activeSource = source;
        const posts = await source.initialize();
        if (Array.isArray(posts) && posts.length > 0) {
            postState.setPosts(posts);
        }

        return postState.getPosts();
    }

    async getAll() {
        return this._getSource().getAll();
    }

    async getById(postId) {
        return this._getSource().getById(postId);
    }

    async getByUserId(userId) {
        return this._getSource().getByUserId(userId);
    }

    async create(postData) {
        return this._getSource().create(postData);
    }

    async update(postId, updates) {
        return this._getSource().update(postId, updates);
    }

    async delete(postId) {
        return this._getSource().delete(postId);
    }

    subscribe(listener) {
        return postState.subscribe(listener);
    }
}

export const postRepository = new PostRepository();