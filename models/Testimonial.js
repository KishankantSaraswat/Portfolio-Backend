const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

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

// Sync to Pinecone after save
testimonialSchema.post('save', async function (doc) {
    console.log('Testimonial saved, syncing to Pinecone...');
    await pineconeService.upsertDocument('testimonial', doc);
});

// Sync to Pinecone after delete
testimonialSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log('Testimonial deleted, removing from Pinecone...');
        await pineconeService.deleteDocument('testimonial', doc._id);
    }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
