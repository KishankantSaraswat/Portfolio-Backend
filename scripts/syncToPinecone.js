require('dotenv').config();
const mongoose = require('mongoose');
const { Pinecone } = require('@pinecone-database/pinecone');

// Import your Mongoose models
const Profile = require('../models/Profile');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const ResumeItem = require('../models/ResumeItem');

// Dynamic import for ES Module @xenova/transformers
let pipeline;

async function initTransformers() {
    console.log('Loading Xenova/all-MiniLM-L6-v2 model...');
    const transformers = await import('@xenova/transformers');
    pipeline = transformers.pipeline;
}

const MONGO_URI = process.env.MONGO_URI;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'portfolio-chat';

if (!MONGO_URI || !PINECONE_API_KEY) {
    console.error('CRITICAL: MONGO_URI or PINECONE_API_KEY is missing in .env');
    process.exit(1);
}

// Initialize Pinecone
const pc = new Pinecone({
    apiKey: PINECONE_API_KEY
});

// Sleep utility to prevent rate limiting
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getEmbedding(text) {
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

async function syncToPinecone() {
    try {
        await initTransformers();

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        const index = pc.index(PINECONE_INDEX);

        console.log('Fetching data from MongoDB...');

        const profile = await Profile.findOne();
        const projects = await Project.find();
        const skills = await Skill.find();
        const resumeItems = await ResumeItem.find();

        const vectors = [];

        // 1. Process Profile
        if (profile) {
            console.log('Processing Profile...');
            // Since the Profile model only has a 'text' field, we use that directly.
            const profileText = profile.text;

            const embedding = await getEmbedding(profileText);

            vectors.push({
                id: `profile-${profile._id.toString()}`,
                values: embedding,
                metadata: {
                    type: 'profile',
                    text: profileText
                }
            });
        }

        // 2. Process Projects
        console.log(`Processing ${projects.length} Projects...`);
        for (const [index, project] of projects.entries()) {
            // Basic rate limiting for local model so we don't block the thread completely
            if (index > 0 && index % 10 === 0) await sleep(500);

            const techStack = Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack;
            const features = Array.isArray(project.features) ? project.features.join(', ') : '';
            const projectText = `Project Name: ${project.title}. Category: ${project.category}. Technology Stack: ${techStack}. Description: ${project.description}. Challenges faced: ${project.challenges}. Solutions provided: ${project.solutions}. Key features: ${features}. Live URL: ${project.liveUrl || 'N/A'}. Github URL: ${project.githubUrl || 'N/A'}.`;

            const embedding = await getEmbedding(projectText);

            vectors.push({
                id: `project-${project._id.toString()}`,
                values: embedding,
                metadata: {
                    type: 'project',
                    text: projectText,
                    title: project.title,
                    category: project.category,
                    imageUrl: project.image || ''
                }
            });
        }

        // 3. Process Skills
        console.log(`Processing ${skills.length} Skills...`);
        const skillsByCategory = {};
        skills.forEach(skill => {
            if (!skillsByCategory[skill.category]) {
                skillsByCategory[skill.category] = [];
            }
            skillsByCategory[skill.category].push(`${skill.name} (${skill.proficiency}%)`);
        });

        for (const [category, skillList] of Object.entries(skillsByCategory)) {
            const skillText = `My skills in the category '${category}' include: ${skillList.join(', ')}.`;
            const embedding = await getEmbedding(skillText);

            vectors.push({
                id: `skills-${category.replace(/[^a-zA-Z0-9]/g, '-')}`,
                values: embedding,
                metadata: {
                    type: 'skill_category',
                    text: skillText,
                    category: category
                }
            });
        }

        // 4. Process Resume Items (Experience/Education)
        console.log(`Processing ${resumeItems.length} Resume Items (Experience/Education)...`);
        for (const [index, item] of resumeItems.entries()) {
            if (index > 0 && index % 10 === 0) await sleep(500);

            const itemText = `Resume Item Type: ${item.type}. Title/Role/Achievement: ${item.title}. Duration: ${item.duration}. Description: ${item.description}.`;

            const embedding = await getEmbedding(itemText);

            vectors.push({
                id: `resume-${item._id.toString()}`,
                values: embedding,
                metadata: {
                    type: 'resume',
                    resumeType: item.type,
                    text: itemText,
                    title: item.title,
                    duration: item.duration
                }
            });
        }

        console.log(`\nReady to upsert ${vectors.length} vectors to Pinecone.`);

        // Upsert in batches of 100
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            console.log(`Upserting batch ${i / batchSize + 1} of ${Math.ceil(vectors.length / batchSize)}...`);
            if (batch.length > 0) {
                await index.upsert({ records: batch });
            }
        }

        console.log('\n✅ Successfully synced all portfolio data to Pinecone!');

    } catch (error) {
        console.error('Error syncing to Pinecone:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
        process.exit(0);
    }
}

syncToPinecone();
