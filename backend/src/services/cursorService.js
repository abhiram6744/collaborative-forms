class CursorService {
    constructor(socketService) {
        this.socketService = socketService;
        this.cursors = new Map(); // formId -> Map(userId -> {fieldId, position})
    }

    updateCursor(formId, userId, fieldId, position, username) {
        if (!this.cursors.has(formId)) {
            this.cursors.set(formId, new Map());
        }

        const formCursors = this.cursors.get(formId);
        formCursors.set(userId, { fieldId, position, username, timestamp: Date.now() });

        // Broadcast cursor position to other users
        this.socketService.io.to(formId).emit('cursor-updated', {
            userId,
            username,
            fieldId,
            position,
            excludeUser: userId
        });
    }

    removeCursor(formId, userId) {
        if (this.cursors.has(formId)) {
            const formCursors = this.cursors.get(formId);
            formCursors.delete(userId);

            this.socketService.io.to(formId).emit('cursor-removed', {
                userId
            });
        }
    }

    getCursors(formId) {
        return this.cursors.get(formId) || new Map();
    }

    cleanupOldCursors() {
        const now = Date.now();
        const timeout = 30000; // 30 seconds

        for (const [formId, formCursors] of this.cursors.entries()) {
            for (const [userId, cursor] of formCursors.entries()) {
                if (now - cursor.timestamp > timeout) {
                    formCursors.delete(userId);
                }
            }
        }
    }
}

module.exports = CursorService;