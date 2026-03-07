const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
