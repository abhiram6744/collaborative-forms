const express = require('express');
const { sequelize } = require('../models');
const Redis = require('ioredis');

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        // Check database connection
        await sequelize.authenticate();

        // Check Redis connection
        const redis = new Redis(process.env.REDIS_URL);
        await redis.ping();
        redis.disconnect();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: 'connected'
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

module.exports = router;