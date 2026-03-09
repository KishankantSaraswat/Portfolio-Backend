const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

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

// Sync to Pinecone after save
skillSchema.post('save', async function (doc) {
    console.log('Skill saved, syncing to Pinecone...');
    await pineconeService.upsertDocument('skill', doc);
});

// Sync to Pinecone after delete
skillSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log('Skill deleted, removing from Pinecone...');
        await pineconeService.deleteDocument('skill', doc._id);
    }
});

module.exports = mongoose.model('Skill', skillSchema);
