const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.json(clients);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
    try {
        const newClient = new Client(req.body);
        const client = await newClient.save();
        res.json(client);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(client);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Client.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Client deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
