class PostState {
    constructor() {
        this.posts = [];
        this.subscribers = new Set();
        this.filters = {};
        this.filterSubscribers = new Set();
    }

    getPosts() {
        return this.posts.map(post => ({ ...post }));
    }

    getPostById(postId) {
        const normalizedPostId = String(postId || '').trim();
        if (!normalizedPostId) return null;

        const post = this.posts.find(candidate => String(candidate.id || '').trim() === normalizedPostId);
        return post ? { ...post } : null;
    }

    setPosts(posts) {
        this.posts = Array.isArray(posts) ? posts.map(post => ({ ...post })) : [];
        this.notify();
    }

    upsertPost(post) {
        if (!post?.id) return null;

        const nextPost = { ...post };
        const index = this.posts.findIndex(candidate => candidate.id === nextPost.id);

        if (index === -1) {
            this.posts.unshift(nextPost);
        } else {
            this.posts[index] = nextPost;
        }

        this.notify();
        return { ...nextPost };
    }

    removePost(postId) {
        const index = this.posts.findIndex(candidate => candidate.id === postId);
        if (index === -1) return false;

        this.posts.splice(index, 1);
        this.notify();
        return true;
    }

    clear() {
        this.posts = [];
        this.notify();
    }

    subscribe(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }

        this.subscribers.add(listener);
        listener(this.getPosts());

        return () => {
            this.subscribers.delete(listener);
        };
    }

    notify() {
        const snapshot = this.getPosts();
        this.subscribers.forEach(listener => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error('[postState] subscriber error', error);
            }
        });
    }

    // ========== FILTER MANAGEMENT ==========

    setFilters(filters) {
        this.filters = { ...filters };
        this.notifyFilters();
    }

    getFilters() {
        return { ...this.filters };
    }

    clearFilters() {
        this.filters = {};
        this.notifyFilters();
    }

    subscribeFilters(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }

        this.filterSubscribers.add(listener);
        listener(this.getFilters());

        return () => {
            this.filterSubscribers.delete(listener);
        };
    }

    notifyFilters() {
        const filters = this.getFilters();
        this.filterSubscribers.forEach(listener => {
            try {
                listener(filters);
            } catch (error) {
                console.error('[postState] filter subscriber error', error);
            }
        });
    }

    // ========== COMMENT MANAGEMENT ==========

    /**
     * Adds a comment to a post
     * @param {string} postId - Post ID
     * @param {string} content - Comment content
     * @param {string} imageUrl - Optional image URL
     * @returns {Object} Created comment
     */
    addComment(postId, content, imageUrl = null) {
        const post = this.getPostById(postId);
        if (!post) {
            throw new Error(`Post ${postId} not found`);
        }

        const comment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            postId,
            content,
            imageUrl,
            userId: null, // Will be set by CommentService
            timestamp: new Date().toISOString()
        };

        if (!Array.isArray(post.comments)) {
            post.comments = [];
        }
        post.comments.push(comment);

        this.notify();
        return { ...comment };
    }

    /**
     * Gets all comments for a post
     * @param {string} postId - Post ID
     * @returns {Array} Comments array
     */
    getComments(postId) {
        const post = this.getPostById(postId);
        if (!post || !Array.isArray(post.comments)) {
            return [];
        }
        return post.comments.map(c => ({ ...c }));
    }

    /**
     * Deletes a comment
     * @param {string} postId - Post ID
     * @param {string} commentId - Comment ID
     * @returns {boolean} Success
     */
    deleteComment(postId, commentId) {
        const post = this.getPostById(postId);
        if (!post || !Array.isArray(post.comments)) {
            return false;
        }

        const index = post.comments.findIndex(c => c.id === commentId);
        if (index === -1) {
            return false;
        }

        post.comments.splice(index, 1);
        this.notify();
        return true;
    }

    /**
     * Gets comment count for a post
     * @param {string} postId - Post ID
     * @returns {number} Comment count
     */
    getCommentCount(postId) {
        const comments = this.getComments(postId);
        return comments.length;
    }
}

export const postState = new PostState();