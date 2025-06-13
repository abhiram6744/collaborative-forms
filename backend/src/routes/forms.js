const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');

class SocketService {
    constructor(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });

        this.redis = new Redis(process.env.REDIS_URL);
        this.fieldLocks = new Map(); // formId -> fieldId -> userId
        this.userSessions = new Map(); // socketId -> { userId, formId }

        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.use(this.authenticateSocket.bind(this));

        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.userId);

            socket.on('join-form', this.handleJoinForm.bind(this, socket));
            socket.on('leave-form', this.handleLeaveForm.bind(this, socket));
            socket.on('field-update', this.handleFieldUpdate.bind(this, socket));
            socket.on('field-lock', this.handleFieldLock.bind(this, socket));
            socket.on('field-unlock', this.handleFieldUnlock.bind(this, socket));
            socket.on('cursor-position', this.handleCursorPosition.bind(this, socket));

            socket.on('disconnect', this.handleDisconnect.bind(this, socket));
        });
    }

    async authenticateSocket(socket, next) {
        try {
            const token = socket.handshake.auth.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    }

    async handleJoinForm(socket, { formId }) {
        try {
            // Verify user can access form
            const form = await this.getFormById(formId);
            if (!form) {
                socket.emit('error', { message: 'Form not found' });
                return;
            }

            socket.join(formId);
            this.userSessions.set(socket.id, {
                userId: socket.userId,
                formId,
                username: socket.username
            });

            // Get current form response
            const response = await this.getFormResponse(formId);
            socket.emit('form-state', response);

            // Notify others of new user
            socket.to(formId).emit('user-joined', {
                userId: socket.userId,
                username: socket.username
            });

            // Send current active users
            const activeUsers = await this.getActiveUsers(formId);
            socket.emit('active-users', activeUsers);

        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    async handleFieldUpdate(socket, { formId, fieldId, value, operation }) {
        try {
            const session = this.userSessions.get(socket.id);
            if (!session || session.formId !== formId) {
                return;
            }

            // Check if field is locked by another user
            const lockKey = `${formId}-${fieldId}`;
            const currentLock = this.fieldLocks.get(lockKey);
            if (currentLock && currentLock !== socket.userId) {
                socket.emit('field-locked', { fieldId, lockedBy: currentLock });
                return;
            }

            // Apply operational transform for concurrent edits
            const transformedValue = await this.applyOperationalTransform(
                formId, fieldId, value, operation
            );

            // Update database
            await this.updateFormResponse(formId, fieldId, transformedValue, socket.userId);

            // Broadcast to all users in the form
            socket.to(formId).emit('field-updated', {
                fieldId,
                value: transformedValue,
                updatedBy: socket.userId,
                username: socket.username,
                timestamp: Date.now()
            });

            // Update Redis cache
            await this.updateResponseCache(formId, fieldId, transformedValue);

        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    async handleFieldLock(socket, { formId, fieldId }) {
        const lockKey = `${formId}-${fieldId}`;
        const currentLock = this.fieldLocks.get(lockKey);

        if (!currentLock) {
            this.fieldLocks.set(lockKey, socket.userId);
            socket.to(formId).emit('field-locked', {
                fieldId,
                lockedBy: socket.userId,
                username: socket.username
            });
        }
    }

    async handleFieldUnlock(socket, { formId, fieldId }) {
        const lockKey = `${formId}-${fieldId}`;
        const currentLock = this.fieldLocks.get(lockKey);

        if (currentLock === socket.userId) {
            this.fieldLocks.delete(lockKey);
            socket.to(formId).emit('field-unlocked', { fieldId });
        }
    }

    async applyOperationalTransform(formId, fieldId, value, operation) {
        // Simple operational transform implementation
        // In production, use libraries like ShareJS or Y.js

        const cacheKey = `form:${formId}:field:${fieldId}`;
        const currentValue = await this.redis.get(cacheKey);

        if (!currentValue) {
            return value;
        }

        // Simple conflict resolution: last write wins with merge attempt
        if (operation && operation.type === 'text-insert') {
            return this.mergeTextOperations(currentValue, value, operation);
        }

        return value;
    }

    mergeTextOperations(currentValue, newValue, operation) {
        // Simplified text merge - in production use proper OT algorithms
        try {
            if (operation.position && operation.insert) {
                const before = currentValue.substring(0, operation.position);
                const after = currentValue.substring(operation.position);
                return before + operation.insert + after;
            }
        } catch (error) {
            console.error('Text merge error:', error);
        }

        return newValue; // Fallback to new value
    }

    async updateFormResponse(formId, fieldId, value, userId) {
        const { FormResponse } = require('../models');

        const [response] = await FormResponse.findOrCreate({
            where: { formId },
            defaults: { formId, responses: {}, lastModifiedBy: userId }
        });

        const updatedResponses = { ...response.responses };
        updatedResponses[fieldId] = value;

        await FormResponse.update({
            responses: updatedResponses,
            lastModifiedBy: userId,
            version: response.version + 1
        }, {
            where: { id: response.id }
        });
    }

    async handleDisconnect(socket) {
        const session = this.userSessions.get(socket.id);
        if (session) {
            // Release all locks held by this user
            for (const [lockKey, userId] of this.fieldLocks.entries()) {
                if (userId === socket.userId) {
                    this.fieldLocks.delete(lockKey);
                    const fieldId = lockKey.split('-').pop();
                    socket.to(session.formId).emit('field-unlocked', { fieldId });
                }
            }

            // Notify others of user leaving
            socket.to(session.formId).emit('user-left', {
                userId: socket.userId,
                username: session.username
            });

            this.userSessions.delete(socket.id);
        }
    }
}

module.exports = SocketService;