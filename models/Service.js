const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    icon: {
        type: String, // e.g., '/assets/images/data-analysis...svg'
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
