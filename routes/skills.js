const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.json(skills);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
    try {
        const newSkill = new Skill(req.body);
        const skill = await newSkill.save();
        res.json(skill);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(skill);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Skill deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
