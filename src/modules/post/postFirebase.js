import { postState } from './postState.js';

class PostFirebase {
    constructor() {
        this.unsubscribe = null;
        this.initialized = false;
    }

    isAvailable() {
        return (
            typeof db !== 'undefined' &&
            typeof collection === 'function' &&
            typeof query === 'function' &&
            typeof getDocs === 'function' &&
            typeof getDoc === 'function' &&
            typeof addDoc === 'function' &&
            typeof doc === 'function' &&
            typeof updateDoc === 'function' &&
            typeof deleteDoc === 'function' &&
            typeof onSnapshot === 'function' &&
            typeof where === 'function' &&
            typeof orderBy === 'function' &&
            typeof serverTimestamp === 'function'
        );
    }

    _normalizeDoc(docSnap) {
        const data = docSnap.data();

        return {
            id: docSnap.id,
            ...data,
            votes: data?.votes || { upvotes: 0, downvotes: 0, usersVoted: {} },
            imageUrl: data?.imageUrl || null,
            createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt || null,
            updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt || null
        };
    }

    async initialize() {
        if (!this.isAvailable()) {
            return [];
        }

        if (this.initialized) {
            return postState.getPosts();
        }

        const posts = await this.getAll();
        postState.setPosts(posts);

        const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        this.unsubscribe = onSnapshot(postsQuery, (snapshot) => {
            const nextPosts = [];
            snapshot.forEach((docSnap) => {
                nextPosts.push(this._normalizeDoc(docSnap));
            });
            postState.setPosts(nextPosts);
        });

        this.initialized = true;
        return posts;
    }

    async getAll() {
        if (!this.isAvailable()) {
            return [];
        }

        const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(postsQuery);
        const posts = [];

        snapshot.forEach((docSnap) => {
            posts.push(this._normalizeDoc(docSnap));
        });

        return posts;
    }

    async getById(postId) {
        if (!this.isAvailable()) {
            return null;
        }

        const docRef = doc(db, 'posts', postId);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;

        return this._normalizeDoc(snapshot);
    }

    async getByUserId(userId) {
        if (!this.isAvailable()) {
            return [];
        }

        const postsQuery = query(
            collection(db, 'posts'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(postsQuery);
        const posts = [];

        snapshot.forEach((docSnap) => {
            posts.push(this._normalizeDoc(docSnap));
        });

        return posts;
    }

    async create(postData) {
        if (!this.isAvailable()) {
            throw new Error('Firebase no disponible');
        }

        const payload = {
            userId: postData.userId,
            content: postData.content,
            imageUrl: postData.imageUrl || null,
            votes: {
                upvotes: 0,
                downvotes: 0,
                usersVoted: {}
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'posts'), payload);
        return {
            id: docRef.id,
            ...payload,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async update(postId, updates) {
        if (!this.isAvailable()) {
            throw new Error('Firebase no disponible');
        }

        const docRef = doc(db, 'posts', postId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        return true;
    }

    async delete(postId) {
        if (!this.isAvailable()) {
            throw new Error('Firebase no disponible');
        }

        const docRef = doc(db, 'posts', postId);
        await deleteDoc(docRef);
        return true;
    }

    subscribe(listener) {
        return postState.subscribe(listener);
    }

    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
}

export const postFirebase = new PostFirebase();