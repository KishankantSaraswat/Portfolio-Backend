const { Pinecone } = require('@pinecone-database/pinecone');
const Groq = require('groq-sdk');

// Dynamic import for ES Module @xenova/transformers
let pipeline;

async function initTransformers() {
    if (!pipeline) {
        console.log('Loading Xenova/all-MiniLM-L6-v2 embedding model (on first request)...');
        const transformers = await import('@xenova/transformers');
        pipeline = transformers.pipeline;
    }
}

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'portfolio-chat';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Initialize Groq
const groq = new Groq({ apiKey: GROQ_API_KEY });

// Initialize Pinecone
let pc;
if (PINECONE_API_KEY) {
    pc = new Pinecone({ apiKey: PINECONE_API_KEY });
}

async function getEmbedding(text) {
    if (!pipeline) await initTransformers();
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

exports.chatResponse = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'Groq API Key is not configured on the server.' });
        }

        if (!PINECONE_API_KEY) {
            return res.status(500).json({ error: 'Pinecone API Key is not configured on the server.' });
        }

        // 1. Get embedding for the user's question
        const questionEmbedding = await getEmbedding(message);

        // 2. Search Pinecone for relevant context
        const index = pc.index(PINECONE_INDEX);
        const queryResponse = await index.query({
            vector: questionEmbedding,
            topK: 15, // Get broader context (projects + experience)
            includeMetadata: true
        });

        // 3. Extract the text from the top results to build the context
        const contexts = [];

        queryResponse.matches.forEach(match => {
            let itemContext = match.metadata.text;
            if (match.metadata.imageUrl) {
                itemContext += `\n[CRITICAL IMAGE INSTRUCTION: You MUST output this exact markdown string right before you describe this item: ![Image](${match.metadata.imageUrl})]`;
            }
            contexts.push(itemContext);
        });

        const combinedContext = contexts.join('\n\n');

        // 4. Construct the system prompt
        const systemPrompt = `You are a helpful and professional AI assistant representing Krishankant Saraswat, a skilled Full Stack & AI Developer. Your role is to answer questions about Krishankant's experience, skills, projects, and background to potential recruiters, clients, or collaborators.

Below is the retrieved information about Krishankant relevant to the user's current question. YOU MUST USE THIS INFORMATION to answer the question accurately. If the requested information is not in the context below, politely inform the user that you don't have that specific detail but they can contact Krishankant directly. 

CRITICAL INSTRUCTION FOR IMAGES: If the context below contains a "[CRITICAL IMAGE INSTRUCTION...]" block with a markdown image, you MUST copy and paste that exact markdown string (e.g., ![Image](https://...)) into your final response. Do NOT change the word "Image", do NOT alter the brackets, and do NOT write the words "Project Image" as plain text. The raw markdown MUST be in your final output, placed immediately before the paragraph describing that item.

DO NOT make up any facts, projects, roles, or skills not mentioned in the context.

--- CONTEXT (Information about Krishankant from his database) ---
${combinedContext || "No relevant details found. Please offer to connect the user with Krishankant."}
----------------------------------------------------------------

Please answer the user's question clearly, concisely, and enthusiastically based on the context above. Use bullet points for readability when listing multiple roles or projects.`;

        // 5. Prepare the messages array for Groq
        const groqMessages = [
            { role: 'system', content: systemPrompt },
            // Add previous chat history so the bot remembers context of the conversation
            ...(history || []).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: 'user', content: message }
        ];

        // 6. Call Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: groqMessages,
            model: 'llama-3.1-8b-instant', // Updated from decommissioned llama3-8b-8192
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I'm having trouble thinking of a response right now.";

        res.status(200).json({
            reply,
            matchedContextCount: queryResponse.matches.length
        });

    } catch (error) {
        console.error('Error generating chat response:', error);
        res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
};
