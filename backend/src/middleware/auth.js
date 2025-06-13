const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        req.user = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
};
```

### Input Validation Middleware

```javascript
// middleware/validation.js
const Joi = require('joi');

const validateForm = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(255).required(),
        description: Joi.string().max(1000).optional(),
        fields: Joi.array().items(
            Joi.object({
                id: Joi.string().required(),
                type: Joi.string().valid('text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox').required(),
                label: Joi.string().min(1).max(255).required(),
                description: Joi.string().max(500).optional(),
                required: Joi.boolean().default(false),
                placeholder: Joi.string().max(255).optional(),
                options: Joi.array().items(
                    Joi.object({
                        value: Joi.string().required(),
                        label: Joi.string().required()
                    })
                ).when('type', {
                    is: Joi.string().valid('select', 'radio', 'checkbox'),
                    then: Joi.required(),
                    otherwise: Joi.optional()
                })
            })
        ).min(1).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
};

const validateUser = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('admin', 'user').default('user')
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
};

module.exports = {
    validateForm,
    validateUser
};