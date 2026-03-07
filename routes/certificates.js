const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const certificates = await Certificate.find().sort({ createdAt: -1 });
        res.json(certificates);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
    try {
        const newCertificate = new Certificate(req.body);
        const certificate = await newCertificate.save();
        res.json(certificate);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(certificate);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Certificate.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Certificate deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
