const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

const certificateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Sync to Pinecone after save
certificateSchema.post('save', async function (doc) {
    console.log('Certificate saved, syncing to Pinecone...');
    await pineconeService.upsertDocument('certificate', doc);
});

// Sync to Pinecone after delete
certificateSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log('Certificate deleted, removing from Pinecone...');
        await pineconeService.deleteDocument('certificate', doc._id);
    }
});

module.exports = mongoose.model('Certificate', certificateSchema);
