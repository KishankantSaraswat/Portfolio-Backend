const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

const sidebarSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    avatar: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    birthday: { type: String, required: true },
    location: { type: String, required: true },
    socials: {
        twitter: { type: String, default: '#' },
        leetcode: { type: String, default: '#' },
        github: { type: String, default: '#' },
        linkedin: { type: String, default: '#' }
    }
});

// Sync to Pinecone after save
sidebarSchema.post('save', async function (doc) {
    console.log('Sidebar Info saved, syncing to Pinecone...');
    await pineconeService.upsertDocument('contact', doc);
});

// Sync to Pinecone after delete
sidebarSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log('Sidebar Info deleted, removing from Pinecone...');
        await pineconeService.deleteDocument('contact', doc._id);
    }
});

module.exports = mongoose.model('SidebarInfo', sidebarSchema);
