const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

const profileSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Sync to Pinecone after save
profileSchema.post('save', async function (doc) {
    console.log('Profile saved, syncing to Pinecone...');
    await pineconeService.upsertDocument('profile', doc);
});

// Sync to Pinecone after delete
profileSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log('Profile deleted, removing from Pinecone...');
        await pineconeService.deleteDocument('profile', doc._id);
    }
});

module.exports = mongoose.model('Profile', profileSchema);
