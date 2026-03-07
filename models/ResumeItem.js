const mongoose = require('mongoose');

const resumeItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Education', 'Experience', 'Achievement'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    duration: {
        type: String, // e.g. "2022 — 2026" or "2024"
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ResumeItem', resumeItemSchema);
