const express = require('express');
const router = express.Router();
const ResumeItem = require('../models/ResumeItem');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const items = await ResumeItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
    try {
        const newItem = new ResumeItem(req.body);
        const item = await newItem.save();
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const item = await ResumeItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await ResumeItem.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Item deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
