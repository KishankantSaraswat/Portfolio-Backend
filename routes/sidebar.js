const express = require('express');
const router = express.Router();
const SidebarInfo = require('../models/SidebarInfo');
const auth = require('../middleware/auth');

// GET sidebar info
router.get('/', async (req, res) => {
    try {
        const sidebar = await SidebarInfo.findOne();
        res.json(sidebar || {});
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST/PUT sidebar info (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        let sidebar = await SidebarInfo.findOne();
        if (sidebar) {
            sidebar = await SidebarInfo.findOneAndUpdate({}, req.body, { new: true });
        } else {
            sidebar = new SidebarInfo(req.body);
            await sidebar.save();
        }
        res.json(sidebar);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
