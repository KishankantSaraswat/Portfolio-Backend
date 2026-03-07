const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['Bar', 'Tag'], // Bar = percentage progress bar, Tag = Technical Expertise
        required: true
    },
    title: {
        type: String,
        required: true
    },
    // Used only for Bar
    percentage: {
        type: Number,
        required: false
    },
    icon: {
        type: String, // ion-icon name
        required: false
    },
    // Used only for Tag
    tags: {
        type: [String],
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
