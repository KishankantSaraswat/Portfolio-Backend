const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// GET
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.findOne();
        res.json(profile || { text: '' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST / PUT (Upsert logic to keep only one profile document)
router.post('/', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (profile) {
            profile.text = req.body.text;
            await profile.save();
        } else {
            profile = new Profile({ text: req.body.text });
            await profile.save();
        }
        res.json(profile);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
