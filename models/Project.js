const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: false, // 1 line for card
    },
    fullSummary: {
        type: String,
        required: false, // 2-3 lines for detail page
    },
    problemStatement: {
        type: String,
        required: false,
    },
    solution: {
        type: String,
        required: false,
    },
    systemArchitecture: {
        type: String,
        required: false, // text description
    },
    architectureImage: {
        type: String,
        required: false, // Base64 image
    },
    architectureType: {
        type: String,
        enum: ['image', 'mermaid'],
        default: 'image'
    },
    architectureCode: {
        type: String,
        required: false, // Mermaid code
    },
    techStack: {
        frontend: [String],
        backend: [String],
        ai_ml: [String],
        database: [String],
        tools: [String]
    },
    keyFeatures: [String],
    challengesLearning: {
        type: String,
        required: false,
    },
    resultsImpact: {
        type: String,
        required: false,
    },
    demoLinks: {
        live: String,
        github: String,
        architecture: String,
        video: String
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [String], // e.g. ["React", "FastAPI", "TensorFlow"]
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Sync to Pinecone after save
projectSchema.post('save', async function (doc) {
    console.log('Project saved, syncing to Pinecone...');
    await pineconeService.upsertDocument('project', doc);
});

// Sync to Pinecone after delete
projectSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log('Project deleted, removing from Pinecone...');
        await pineconeService.deleteDocument('project', doc._id);
    }
});

module.exports = mongoose.model('Project', projectSchema);
