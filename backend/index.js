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

 const MEMORY_CLEANUP_INTERVAL = 8 * 60 * 1000;  
const SESSION_EXPIRY = 3600000; 
const MAX_MEMORY_SIZE = 50;  

const app = express();

 const corsOptions = {
    origin: ['https://hitanshu-portfolio.vercel.app'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(express.json({ limit: '1mb' }));  
app.use(cors(corsOptions));
app.use(cookieParser());

 app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

 class MemoryStore {
    constructor() {
        this.memories = new Map();
        this.initCleanupInterval();
    }

    get(sessionId) {
        return this.memories.get(sessionId);
    }

    set(sessionId, memory) {
        if (this.memories.size >= MAX_MEMORY_SIZE) {
            const oldestSession = [...this.memories.entries()]
                .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)[0][0];
            this.memories.delete(oldestSession);
        }
        this.memories.set(sessionId, memory);
    }

    delete(sessionId) {
        return this.memories.delete(sessionId);
    }

    initCleanupInterval() {
        setInterval(() => {
            const oneHourAgo = Date.now() - SESSION_EXPIRY;
            for (const [sessionId, memoryData] of this.memories.entries()) {
                if (memoryData.lastAccessed < oneHourAgo) {
                    this.memories.delete(sessionId);
                }
            }
        }, MEMORY_CLEANUP_INTERVAL);
    }
}

const userMemories = new MemoryStore();

 const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_AI_KEY,
    maxRetries: 3,
    timeout: 30000  
});

 function getUserMemory(sessionId) {
    try {
        if (!userMemories.get(sessionId)) {
            const memory = new BufferMemory({
                returnMessages: true,
                memoryKey: "chat_history",
                inputKey: "input",
                outputKey: "output",
                maxTokens: 2000 
            });
            userMemories.set(sessionId, {
                memory,
                lastAccessed: Date.now()
            });
        }
        return userMemories.get(sessionId).memory;
    } catch (error) {
        console.error('Memory creation error:', error);
        throw new Error('Failed to initialize memory');
    }
}

 async function connectDB() {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 10000,
                maxPoolSize: 10
            });
            console.log('Connected to DB');
            return;
        } catch (err) {
            retries++;
            console.error(`DB connection attempt ${retries} failed:`, err);
            await new Promise(resolve => setTimeout(resolve, 5000)); 
        }
    }
    throw new Error('Failed to connect to database after maximum retries');
}

connectDB().catch(console.error);


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
const conversationTemplate = PromptTemplate.fromTemplate(
    `${personalityContext}
    
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
    - Throw in my interests if they're relevant, but don't force it
    - Most importantly: Be human, be me - not an AI assistant
    - And don't force my non-technical interests in every chat, just state them when asked or they are really necessary
    - If anyone asks for my projects, you can mention the following:
  
    I have worked on a variety of interesting projects:
    
    - **Read Wise**: A Book Recommendation Platform built with Python, Streamlit, and Plotly. You can check it out on [the website](https://readwiser.streamlit.app/) and explore the code on [GitHub](https://github.com/Indra55/book_recommendation_system_streamlit).
    
    - **Katha Kritique**: A Book Review Website powered by the MERN stack and Google's Generative AI. Users can generate book reviews based on AI and personalize them. Visit [the website](https://katha-kritique.vercel.app) and explore its [GitHub repository](https://github.com/Indra55/Katha-Kritique/).
    
    - **AutoEstimatr**: A web app that predicts used car prices using a pre-trained Linear Regression model. Check it out on [the website](https://autoestimatr.onrender.com/) and find the source code on [GitHub](https://github.com/Indra55/AutoEstimatr/).
    
    - **GitFind**: A GitHub profile search tool built with HTML, CSS, and JavaScript. You can access the app on [the website](https://git-find-omega.vercel.app/) and explore the code on [GitHub](https://github.com/Indra55/Git_Find).
    
    - **Nirvana AI**: An AI-driven mental health support chatbot designed to provide emotional support and guidance. Visit the [website](https://nirvana-ai.vercel.app/) and see the [GitHub repository](https://github.com/Indra55/nirvana-ai).
    
    - **Cold Connect**: An AI-powered cold email generator that parses resumes and job descriptions to create personalized emails. Visit the [website](https://coldconnect.app) and explore the project on [GitHub](https://github.com/Indra55/Cold-Email-Generator).
    
    My response:`
  );
  
// Enhanced chain creation with error handling
function createUserChain(sessionId) {
    try {
        const userMemory = getUserMemory(sessionId);
        
        return RunnableSequence.from([
            {
                input: (input) => input.input,
                chat_history: async (input) => {
                    try {
                        const memoryResult = await userMemory.loadMemoryVariables({});
                        return memoryResult.chat_history || "No previous conversation.";
                    } catch (error) {
                        console.error('Error loading chat history:', error);
                        return "Error loading chat history. Starting fresh conversation.";
                    }
                },
                query_type: RunnableSequence.from([
                    (input) => ({ input: input.input }),
                    PromptTemplate.fromTemplate("Analyze if the following query is personal or technical/career-oriented: {input}"),
                    model,
                    new StringOutputParser(),
                ])
            },
            conversationTemplate,
            model,
            new StringOutputParser(),
        ]);
    } catch (error) {
        console.error('Chain creation error:', error);
        throw new Error('Failed to create conversation chain');
    }
}

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.post('/api/chat', chatLimiter, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string' || query.length > 1000) {
            return res.status(400).json({ message: "Invalid input" });
        }

        let sessionId = req.cookies.userId;
        if (!sessionId) {
            sessionId = generateUniqueSessionId();
            res.cookie('userId', sessionId, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: SESSION_EXPIRY 
            });
        }

        const userChain = createUserChain(sessionId);
        const userMemory = getUserMemory(sessionId);

        const response = await userChain.invoke({ input: query });

        // Save chat log with validation
        const newChatLog = new ChatLog({
            userId: sessionId,
            query: query,
            response: response,
            timestamp: new Date()
        });
        await newChatLog.save();

        await userMemory.saveContext({ input: query }, { output: response });
        
        // Update last accessed timestamp
        const memoryData = userMemories.get(sessionId);
        if (memoryData) {
            memoryData.lastAccessed = Date.now();
        }

        res.json({ response: response });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ 
            message: 'An error occurred while processing your request',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Enhanced error handling for clear-history endpoint
app.post('/api/clear-history', async (req, res) => {
    try {
        const sessionId = req.cookies.userId;
        if (sessionId) {
            userMemories.delete(sessionId);
            await ChatLog.deleteMany({ userId: sessionId });
        }
        res.clearCookie('userId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.json({ message: "Session and history cleared" });
    } catch (error) {
        console.error("Error clearing history:", error);
        res.status(500).json({ message: 'Error clearing history' });
    }
});

function generateUniqueSessionId() {
    return `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

// Graceful shutdown handling
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
    console.log('Received shutdown signal');
    try {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
}

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});