const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

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

// Sync to Pinecone after save
resumeItemSchema.post('save', async function (doc) {
    console.log('ResumeItem saved, syncing to Pinecone...');
    await pineconeService.upsertDocument('resume', doc);
});

// Sync to Pinecone after delete
resumeItemSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log('ResumeItem deleted, removing from Pinecone...');
        await pineconeService.deleteDocument('resume', doc._id);
    }
});

module.exports = mongoose.model('ResumeItem', resumeItemSchema);
