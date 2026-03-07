const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check for hardcoded fallback for development testing
        // In production, ensure the user exists in DB
        let admin = await Admin.findOne({ username });

        // Auto-create initial admin if none exists (for ease of setup)
        if (!admin && username === 'admin' && password === 'admin123') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            admin = new Admin({ username, password: hashedPassword });
            await admin.save();
        }

        if (!admin) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { admin: { id: admin.id } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Verify token to persist login state
router.get('/verify', require('../middleware/auth'), (req, res) => {
    res.json({ valid: true });
});

module.exports = router;
