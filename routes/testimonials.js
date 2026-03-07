const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');

// @route   GET /api/testimonials
// @desc    Get all testimonials
// @access  Public
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/testimonials
// @desc    Create a testimonial
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, date, avatar, text } = req.body;

    try {
        const newTestimonial = new Testimonial({
            name,
            date,
            avatar,
            text
        });

        const testimonial = await newTestimonial.save();
        res.json(testimonial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/testimonials/:id
// @desc    Update a testimonial
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, date, avatar, text } = req.body;

    try {
        let testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).json({ msg: 'Testimonial not found' });

        testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { $set: { name, date, avatar, text } },
            { new: true }
        );

        res.json(testimonial);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete a testimonial
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).json({ msg: 'Testimonial not found' });

        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Testimonial removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
