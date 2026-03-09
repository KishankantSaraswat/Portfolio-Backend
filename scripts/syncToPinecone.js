require('dotenv').config();
const mongoose = require('mongoose');
const pineconeService = require('../services/pineconeService');

// Import your Mongoose models
const Profile = require('../models/Profile');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const ResumeItem = require('../models/ResumeItem');
const SidebarInfo = require('../models/SidebarInfo');
const Service = require('../models/Service');
const Certificate = require('../models/Certificate');
const Testimonial = require('../models/Testimonial');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('CRITICAL: MONGO_URI is missing in .env');
    process.exit(1);
}

// Sleep utility to prevent rate limiting
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function syncToPinecone() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        console.log('Fetching data from MongoDB...');

        const profile = await Profile.findOne();
        const projects = await Project.find();
        const skills = await Skill.find();
        const resumeItems = await ResumeItem.find();
        const sidebarInfo = await SidebarInfo.findOne();
        const services = await Service.find();
        const certificates = await Certificate.find();
        const testimonials = await Testimonial.find();

        // 1. Process Profile
        if (profile) {
            console.log('Processing Profile...');
            await pineconeService.upsertDocument('profile', profile);
        }

        // 2. Process Projects
        console.log(`Processing ${projects.length} Projects...`);
        for (const [index, project] of projects.entries()) {
            if (index > 0 && index % 5 === 0) await sleep(500); // Throttling
            await pineconeService.upsertDocument('project', project);
        }

        // 3. Process Skills
        console.log(`Processing ${skills.length} Skills...`);
        for (const skill of skills) {
            await pineconeService.upsertDocument('skill', skill);
        }

        // 4. Process Resume Items (Experience/Education)
        console.log(`Processing ${resumeItems.length} Resume Items...`);
        for (const item of resumeItems) {
            await pineconeService.upsertDocument('resume', item);
        }

        // 5. Process Sidebar Info (Contact Details)
        if (sidebarInfo) {
            console.log('Processing Sidebar Info...');
            await pineconeService.upsertDocument('contact', sidebarInfo);
        }

        // 6. Process Services
        console.log(`Processing ${services.length} Services...`);
        for (const service of services) {
            await pineconeService.upsertDocument('service', service);
        }

        // 7. Process Certificates
        console.log(`Processing ${certificates.length} Certificates...`);
        for (const cert of certificates) {
            await pineconeService.upsertDocument('certificate', cert);
        }

        // 8. Process Testimonials
        console.log(`Processing ${testimonials.length} Testimonials...`);
        for (const test of testimonials) {
            await pineconeService.upsertDocument('testimonial', test);
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
