import { postRepository } from './postRepository.js';
import { postState } from './postState.js';
import { userService } from '../auth/userService.js';
import { commentService } from './CommentService.js';
import { isValidText } from '../../utils/utils.js';

class PostService {
    async initialize() {
        return postRepository.initialize();
    }

    async getFeed() {
        const posts = await postRepository.getAll();

        return Promise.all(posts.map(async (post) => ({
            ...post,
            author: await userService.getUserById(post.userId) || {},
            commentCount: commentService.getCommentCount(post.id)
        })));
    }

    async getPostById(postId) {
        const post = await postRepository.getById(postId);
        if (!post) return null;

        return {
            ...post,
            author: await userService.getUserById(post.userId) || {},
            commentCount: commentService.getCommentCount(post.id)
        };
    }

    async createPost(content, imageFile = null) {
        const currentUser = userService.getCurrentUser();
        if (!currentUser?.isLoggedIn) {
            return {
                success: false,
                error: 'Debes iniciar sesión para publicar',
                post: null,
                postId: null
            };
        }

        if (!isValidText(content) && !imageFile) {
            return {
                success: false,
                error: 'Debes escribir algo o seleccionar una imagen',
                post: null,
                postId: null
            };
        }

        try {
            const post = await postRepository.create({
                userId: currentUser.uid || currentUser.id,
                content: String(content || '').trim(),
                imageFile
            });

            return {
                success: true,
                post,
                postId: post.id,
                message: 'Publicación creada exitosamente'
            };
        } catch (error) {
            console.error('Error creating post:', error);
            return {
                success: false,
                error: error.message,
                post: null,
                postId: null
            };
        }
    }

    async updatePost(postId, newContent) {
        const currentUser = userService.getCurrentUser();
        if (!currentUser?.isLoggedIn) {
            return { success: false, error: 'Debes iniciar sesión' };
        }

        const post = await postRepository.getById(postId);
        if (!post) {
            return { success: false, error: 'Publicación no encontrada' };
        }

        if (post.userId !== currentUser.uid) {
            return { success: false, error: 'No tienes permiso para editar esta publicación' };
        }

        if (!isValidText(newContent)) {
            return { success: false, error: 'El contenido no puede estar vacío' };
        }

        try {
            await postRepository.update(postId, { content: newContent.trim() });
            return { success: true, message: 'Publicación actualizada' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deletePost(postId) {
        const currentUser = userService.getCurrentUser();
        if (!currentUser?.isLoggedIn) {
            return { success: false, error: 'Debes iniciar sesión' };
        }

        const post = await postRepository.getById(postId);
        if (!post) {
            return { success: false, error: 'Publicación no encontrada' };
        }

        if (post.userId !== currentUser.uid) {
            return { success: false, error: 'No tienes permiso para eliminar esta publicación' };
        }

        try {
            await postRepository.delete(postId);
            return { success: true, message: 'Publicación eliminada' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async canUserPerformAction(postId) {
        const currentUser = userService.getCurrentUser();
        if (!currentUser?.isLoggedIn) return false;

        const post = await postRepository.getById(postId);
        if (!post) return false;

        return post.userId === currentUser.uid;
    }

    async toggleUpvote(postId) {
        const currentUser = userService.getCurrentUser();
        if (!currentUser?.isLoggedIn) {
            return { success: false, error: 'Debes iniciar sesión para votar' };
        }

        const post = await postRepository.getById(postId);
        if (!post) {
            return { success: false, error: 'Publicación no encontrada' };
        }

        const votes = { upvotes: 0, downvotes: 0, usersVoted: {}, ...(post.votes || {}) };
        const currentVote = votes.usersVoted[currentUser.uid] || null;

        if (currentVote === 'up') {
            delete votes.usersVoted[currentUser.uid];
            votes.upvotes = Math.max(0, votes.upvotes - 1);
        } else if (currentVote === 'down') {
            votes.usersVoted[currentUser.uid] = 'up';
            votes.downvotes = Math.max(0, votes.downvotes - 1);
            votes.upvotes += 1;
        } else {
            votes.usersVoted[currentUser.uid] = 'up';
            votes.upvotes += 1;
        }

        try {
            await postRepository.update(postId, { votes });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async toggleDownvote(postId) {
        const currentUser = userService.getCurrentUser();
        if (!currentUser?.isLoggedIn) {
            return { success: false, error: 'Debes iniciar sesión para votar' };
        }

        const post = await postRepository.getById(postId);
        if (!post) {
            return { success: false, error: 'Publicación no encontrada' };
        }

        const votes = { upvotes: 0, downvotes: 0, usersVoted: {}, ...(post.votes || {}) };
        const currentVote = votes.usersVoted[currentUser.uid] || null;

        if (currentVote === 'down') {
            delete votes.usersVoted[currentUser.uid];
            votes.downvotes = Math.max(0, votes.downvotes - 1);
        } else if (currentVote === 'up') {
            votes.usersVoted[currentUser.uid] = 'down';
            votes.upvotes = Math.max(0, votes.upvotes - 1);
            votes.downvotes += 1;
        } else {
            votes.usersVoted[currentUser.uid] = 'down';
            votes.downvotes += 1;
        }

        try {
            await postRepository.update(postId, { votes });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    subscribe(listener) {
        return postState.subscribe(listener);
    }
}

export const postService = new PostService();