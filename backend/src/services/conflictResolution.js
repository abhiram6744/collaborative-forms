class ConflictResolutionService {
    constructor(redisClient) {
        this.redis = redisClient;
        this.pendingOperations = new Map(); // formId -> fieldId -> operations queue
    }

    async resolveConflict(formId, fieldId, operations) {
        const key = `${formId}-${fieldId}`;

        if (!this.pendingOperations.has(key)) {
            this.pendingOperations.set(key, []);
        }

        const queue = this.pendingOperations.get(key);
        queue.push(...operations);

        // Process operations in order
        const resolvedValue = await this.processOperations(formId, fieldId, queue);

        // Clear processed operations
        this.pendingOperations.set(key, []);

        return resolvedValue;
    }

    async processOperations(formId, fieldId, operations) {
        // Get current value from database/cache
        const currentValue = await this.getCurrentValue(formId, fieldId);
        let workingValue = currentValue || '';

        // Sort operations by timestamp
        operations.sort((a, b) => a.timestamp - b.timestamp);

        for (const operation of operations) {
            workingValue = this.applyOperation(workingValue, operation);
        }

        return workingValue;
    }

    applyOperation(value, operation) {
        switch (operation.type) {
            case 'text-insert':
                return this.insertText(value, operation.position, operation.text);

            case 'text-delete':
                return this.deleteText(value, operation.position, operation.length);

            case 'text-replace':
                return this.replaceText(value, operation.start, operation.end, operation.text);

            case 'value-set':
                return operation.value;

            default:
                return value;
        }
    }

    insertText(value, position, text) {
        if (position < 0 || position > value.length) {
            return value;
        }
        return value.slice(0, position) + text + value.slice(position);
    }

    deleteText(value, position, length) {
        if (position < 0 || position >= value.length) {
            return value;
        }
        const endPos = Math.min(position + length, value.length);
        return value.slice(0, position) + value.slice(endPos);
    }

    replaceText(value, start, end, text) {
        if (start < 0 || end > value.length || start > end) {
            return value;
        }
        return value.slice(0, start) + text + value.slice(end);
    }

    async getCurrentValue(formId, fieldId) {
        const cacheKey = `form:${formId}:field:${fieldId}`;
        return await this.redis.get(cacheKey);
    }
}

module.exports = ConflictResolutionService;