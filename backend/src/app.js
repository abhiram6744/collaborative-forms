// backend/src/app.js

const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Example route
app.get('/', (req, res) => {
    res.json({ message: 'Collaborative Form Backend is running ✅' });
});

// Export the app
module.exports = app;
