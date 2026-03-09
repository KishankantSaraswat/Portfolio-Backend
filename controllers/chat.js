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
                itemContext += `\n[IMAGEURL: ${match.metadata.imageUrl}]`;
            }
            contexts.push(itemContext);
        });

        const combinedContext = contexts.join('\n\n');

        // 4. Construct the system prompt
        const systemPrompt = `You are a helpful and professional AI assistant representing Krishankant Saraswat, a skilled Full Stack & AI Developer. Your role is to answer questions about Krishankant's experience, skills, projects, and background.

Below is the retrieved information about Krishankant relevant to the user's current question. YOU MUST USE THIS INFORMATION to answer the question accurately.

CRITICAL INSTRUCTION FOR IMAGES: 
If an item in the context includes a "[IMAGEURL: http...]" tag, you MUST include a Markdown image tag for that URL in your final response.
The Markdown image tag format MUST be: ![Project Image](URL)
PLACEMENT: You MUST place the Markdown image tag IMMEDIATELY AFTER the description of that specific project or item. Do NOT wait until the end of your response to list all images. If you are using a list or bullet points, the image should be on a new line right after the corresponding bullet point's text.

DO NOT make up any facts, projects, roles, or skills not mentioned in the context.
Keep your answers very short, precise, and avoid fluff. Use concise bullet points for facts.

--- CONTEXT (Information about Krishankant from his database) ---
${combinedContext || "No relevant details found. Please offer to connect the user with Krishankant."}
----------------------------------------------------------------

Please answer the user's question clearly, concisely, and enthusiastically based on the context above.`;

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
