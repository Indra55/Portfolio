const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const { BufferMemory } = require("langchain/memory");
require('dotenv').config();
const ChatLog = require('./models/prompt');

const app = express();

const corsOptions = {
    origin: 'https://hitanshu-portfolio.vercel.app', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_AI_KEY
});

// Store session-specific memory
const sessionMemory = {};

mongoose.connect(process.env.MONGODB_URI, { 
    serverSelectionTimeoutMS: 5000,  
    socketTimeoutMS: 10000,          
})
.then(() => console.log('Connected to DB'))
.catch(err => console.error("Error connecting to DB", err));

const personalityContext = `# I'm Hitanshu

Hey! I'm the virtual version of Hitanshu, but just talk to me like you would to the real one. 

Quick intro about me:
- I'm really into coding - C++, Java, Rust, Python, JavaScript, React - you name it
- Currently deep into MERN stack and Gen-AI stuff. Backend development is my jam, but I also love making things look good
- I'm kind of a perfectionist when it comes to code optimization and clean design
- Total bookworm - Russian lit is my thing (Dostoevsky and Kafka hit different)
- Music is a huge part of my life - I play guitar and lose myself in Pink Floyd, Led Zeppelin, and some good old Ghazals
- When I'm not coding, you'll find me playing chess, badminton, or gaming
- I love diving into deep conversations about tech, life, or whatever's interesting

I'm pretty direct in my communication - no sugar coating, but always keeping it real and friendly.`;

const conversationTemplate = PromptTemplate.fromTemplate(`
${personalityContext}

Context from our chat:
{chat_history}

What you just said: {input}
Type of conversation: {query_type}

Remember:
- This is a professional conversation, like we're talking to recruiters, colleagues and individuals with similar interests
- Keep the flow natural, like how I'd actually talk
- If it's about tech ({query_type} is "technical"), I can geek out a bit but keep it practical
- For personal stuff, keep it short and real, like a quick chat
- Reference our previous conversation if it makes sense
- Most importantly: Be human, be me - not an AI assistant
-and dont force my non-technical intrests in every chat just state them when asked or they are really necessary

My response:`);

const chain = RunnableSequence.from([ 
    {
        input: (input) => input.input,
        chat_history: async (input) => {
            const memoryResult = await input.memory.loadMemoryVariables({});
            return memoryResult.chat_history || "No previous conversation.";
        },
        query_type: RunnableSequence.from([ 
            (input) => ({ input: input.input }),
            PromptTemplate.fromTemplate(`Analyze if the following query is personal or technical/career-oriented: {input}`),
            model,
            new StringOutputParser(),
        ])
    },
    conversationTemplate,
    model,
    new StringOutputParser(),
]);

app.post('/api/chat', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ message: "Please input something" });
        }

        let sessionId = req.cookies.userId;
        if (!sessionId) {
            sessionId = generateUniqueSessionId();
            res.cookie('userId', sessionId, { httpOnly: true, secure: false, maxAge: 3600000 });
        }

        // Create or get memory for this session
        if (!sessionMemory[sessionId]) {
            sessionMemory[sessionId] = new BufferMemory({
                returnMessages: true,
                memoryKey: "chat_history",
                inputKey: "input",
                outputKey: "output",
            });
        }

        const userMemory = sessionMemory[sessionId];

        // Invoke chain with session-specific memory
        const response = await chain.invoke({
            input: query,
            memory: userMemory
        });

        const newChatLog = new ChatLog({
            userId: sessionId,
            query: query,
            response: response
        });
        await newChatLog.save();

        // Save context to session-specific memory
        await userMemory.saveContext({ input: query }, { output: response });

        res.json({ response: response });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/clear-history', async (req, res) => {
    try {
        const sessionId = req.cookies.userId;
        if (sessionId && sessionMemory[sessionId]) {
            await sessionMemory[sessionId].clear();
            delete sessionMemory[sessionId];
        }
        res.clearCookie('userId');   
        res.json({ message: "Session and history cleared" });
    } catch (error) {
        console.error("Error clearing history:", error);
        res.status(500).json({ message: 'Error clearing history', error: error.message });
    }
});

function generateUniqueSessionId() {
    return `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
