const { Pinecone } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'portfolio-chat';

if (!PINECONE_API_KEY) {
    console.error('CRITICAL: PINECONE_API_KEY is missing in .env');
}

const pc = new Pinecone({
    apiKey: PINECONE_API_KEY
});

let pipeline;

async function initTransformers() {
    if (!pipeline) {
        console.log('Loading Xenova/all-MiniLM-L6-v2 model...');
        const transformers = await import('@xenova/transformers');
        pipeline = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return pipeline;
}

async function getEmbedding(text) {
    const embedder = await initTransformers();
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

const getProjectText = (project) => {
    const techStackStrings = [];
    if (project.techStack) {
        if (project.techStack.frontend?.length) techStackStrings.push(`Frontend: ${project.techStack.frontend.join(', ')}`);
        if (project.techStack.backend?.length) techStackStrings.push(`Backend: ${project.techStack.backend.join(', ')}`);
        if (project.techStack.ai_ml?.length) techStackStrings.push(`AI/ML: ${project.techStack.ai_ml.join(', ')}`);
        if (project.techStack.database?.length) techStackStrings.push(`Database: ${project.techStack.database.join(', ')}`);
        if (project.techStack.tools?.length) techStackStrings.push(`Tools: ${project.techStack.tools.join(', ')}`);
    }
    const techStack = techStackStrings.join('; ');
    const features = Array.isArray(project.keyFeatures) ? project.keyFeatures.join(', ') : '';

    return `Project Name: ${project.title}. Category: ${project.category}. Technology Stack: ${techStack}. Description: ${project.shortDescription || ''} ${project.fullSummary || ''}. Problem Statement: ${project.problemStatement || ''}. Solution: ${project.solution || ''}. Challenges & Learning: ${project.challengesLearning || ''}. Results & Impact: ${project.resultsImpact || ''}. Key features: ${features}. Live URL: ${project.demoLinks?.live || 'N/A'}. Github URL: ${project.demoLinks?.github || 'N/A'}.`;
};

const getSkillText = (skill) => {
    if (skill.category === 'Bar') {
        return `Skill: ${skill.title}. Proficiency: ${skill.percentage}%.`;
    } else if (skill.category === 'Tag') {
        return `Expertise in ${skill.title}: ${skill.tags.join(', ')}.`;
    }
    return '';
};

const getResumeItemText = (item) => {
    return `Resume Item Type: ${item.type}. Title/Role/Achievement: ${item.title}. Duration: ${item.duration}. Description: ${item.description}.`;
};

const getSidebarText = (info) => {
    return `My contact information: Name: ${info.name}. Title: ${info.title}. Email: ${info.email}. Phone: ${info.phone}. Birthday: ${info.birthday}. Location: ${info.location}. LinkedIn: ${info.socials?.linkedin || 'N/A'}. GitHub: ${info.socials?.github || 'N/A'}. LeetCode: ${info.socials?.leetcode || 'N/A'}. Twitter: ${info.socials?.twitter || 'N/A'}.`;
};

const getServiceText = (service) => {
    return `Service offered: ${service.title}. Description: ${service.text}.`;
};

const getCertificateText = (cert) => {
    return `Certificate: ${cert.title}. Category: ${cert.category}. Date: ${cert.date}. Description: ${cert.description}. Link: ${cert.link}.`;
};

const getTestimonialText = (test) => {
    return `Testimonial from ${test.name} (Dated: ${test.date}): "${test.text}"`;
};

const getProfileText = (profile) => {
    return profile.text;
};

/**
 * Upsert a single document to Pinecone
 * @param {string} type - The type of document (project, resume, profile, etc.)
 * @param {Object} doc - The Mongoose document
 */
async function upsertDocument(type, doc) {
    try {
        let text = '';
        const metadata = { type, text: '' };

        switch (type) {
            case 'project':
                text = getProjectText(doc);
                metadata.title = doc.title;
                metadata.category = doc.category;
                metadata.imageUrl = doc.image || '';
                break;
            case 'resume':
                text = getResumeItemText(doc);
                metadata.resumeType = doc.type;
                metadata.title = doc.title;
                metadata.duration = doc.duration;
                break;
            case 'profile':
                text = getProfileText(doc);
                break;
            case 'contact':
                text = getSidebarText(doc);
                metadata.name = doc.name;
                metadata.email = doc.email;
                break;
            case 'service':
                text = getServiceText(doc);
                metadata.title = doc.title;
                break;
            case 'certificate':
                text = getCertificateText(doc);
                metadata.title = doc.title;
                metadata.date = doc.date;
                break;
            case 'testimonial':
                text = getTestimonialText(doc);
                metadata.name = doc.name;
                break;
            case 'skill':
                text = getSkillText(doc);
                metadata.title = doc.title;
                metadata.category = doc.category;
                break;
            default:
                console.warn(`Unknown document type: ${type}`);
                return;
        }

        metadata.text = text;
        const embedding = await getEmbedding(text);
        const index = pc.index(PINECONE_INDEX);

        const id = `${type}-${doc._id.toString()}`;
        console.log(`Upserting ${id} to Pinecone...`);

        await index.upsert({
            records: [{
                id,
                values: embedding,
                metadata
            }]
        });

        console.log(`Successfully upserted ${id} to Pinecone.`);
    } catch (error) {
        console.error(`Error upserting document of type ${type}:`, error);
    }
}

/**
 * Delete a document from Pinecone
 * @param {string} type - The type of document
 * @param {string} docId - The document ID
 */
async function deleteDocument(type, docId) {
    try {
        const index = pc.index(PINECONE_INDEX);
        const id = `${type}-${docId.toString()}`;
        console.log(`Deleting ${id} from Pinecone...`);
        await index.deleteOne({ id });
        console.log(`Successfully deleted ${id} from Pinecone.`);
    } catch (error) {
        console.error(`Error deleting document ${docId} of type ${type}:`, error);
    }
}

module.exports = {
    upsertDocument,
    deleteDocument,
    getEmbedding // Exported for use in sync script
};
