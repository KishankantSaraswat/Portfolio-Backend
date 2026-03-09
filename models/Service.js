const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

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

// Sync to Pinecone after save
serviceSchema.post('save', async function (doc) {
    console.log('Service saved, syncing to Pinecone...');
    await pineconeService.upsertDocument('service', doc);
});

// Sync to Pinecone after delete
serviceSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log('Service deleted, removing from Pinecone...');
        await pineconeService.deleteDocument('service', doc._id);
    }
});

module.exports = mongoose.model('Service', serviceSchema);
