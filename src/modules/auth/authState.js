class UserState {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.subscribers = new Set();
    }

    getCurrentUser() {
        return this.currentUser ? { ...this.currentUser } : null;
    }

    getUsers() {
        return this.users.map(user => ({ ...user }));
    }

    getUserById(userId) {
        const normalizedUserId = String(userId || '').trim();
        if (!normalizedUserId) return null;

        const user = this.users.find(candidate => {
            const candidateId = String(candidate.id || '').trim();
            const candidateUid = String(candidate.uid || '').trim();
            return candidateId === normalizedUserId || candidateUid === normalizedUserId;
        });

        return user ? { ...user } : null;
    }

    setUsers(users) {
        this.users = Array.isArray(users) ? users.map(user => ({ ...user })) : [];
        this.notify();
    }

    setCurrentUser(user) {
        this.currentUser = user ? { ...user } : null;
        this.notify();
    }

    subscribe(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }

        this.subscribers.add(listener);
        listener(this.snapshot());

        return () => {
            this.subscribers.delete(listener);
        };
    }

    snapshot() {
        return {
            currentUser: this.getCurrentUser(),
            users: this.getUsers()
        };
    }

    notify() {
        const snapshot = this.snapshot();
        this.subscribers.forEach(listener => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error('[userState] subscriber error', error);
            }
        });
    }

    /**
     * Updates the current user's profile
     * @param {Object} updates - Profile updates (nombre, apodo, bio, etc)
     * @returns {boolean} Success
     */
    updateCurrentUserProfile(updates) {
        if (!this.currentUser) {
            return false;
        }

        this.currentUser = {
            ...this.currentUser,
            ...updates
        };
        this.notify();
        return true;
    }
}

export const userState = new UserState();