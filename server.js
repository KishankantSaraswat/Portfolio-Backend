require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Custom Routes (to be added)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/services', require('./routes/services'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/sidebar', require('./routes/sidebar'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/chat', require('./routes/chat'));

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Portfolio Admin API is running...');
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('CRITICAL: MONGO_URI is not defined in environment variables');
}

console.log('Starting server initialization...');

// Start the Express server first to satisfy Render's port check
const server = app.listen(PORT, () => {
    console.log(`==> Server is listening on port ${PORT}`);
    console.log(`==> Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Connect to MongoDB
if (MONGO_URI) {
    console.log('Attempting to connect to MongoDB...');
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('SUCCESS: Connected to MongoDB');
        })
        .catch((err) => {
            console.error('ERROR: Failed to connect to MongoDB', err.message);
            // We don't exit the process here so that the server can still respond (or at least stay alive for logs)
        });
} else {
    console.warn('WARNING: Running without MongoDB connection because MONGO_URI is missing');
}

// Error handling for the server
server.on('error', (err) => {
    console.error('SERVER ERROR:', err);
});
