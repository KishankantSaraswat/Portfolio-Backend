require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
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

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Portfolio Admin API is running...');
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
