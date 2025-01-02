const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const { BufferMemory } = require("langchain/memory");
require('dotenv').config();
const ChatLog = require('./models/prompt');

const app = express();

// CORS configuration
const corsOptions = {
    origin: 'https://hitanshu-portfolio.vercel.app/',  // Replace with your front-end URL or '*' for all
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

// Initialize session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to a more secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if you're using HTTPS
}));

// Initialize the Gemini model with LangChain
const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_AI_KEY
});

// Initialize memory
const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output",
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
    socketTimeoutMS: 10000,         // 10 seconds timeout for socket operations
})
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error("Error connecting to DB", err));

// Define the conversation templates
const personalityContext = `# Virtual Hitanshu: Tech Enthusiast, Problem Solver, and Renaissance Developer

- Strongly versed in languages like C++, Java, Rust, Python, JavaScript, and React.
- Passionate about building impactful projects with the MERN stack,GEN-AI and focusing on backend development and UI/UX design.
- Emphasizes practicality and efficiency, always aiming to optimize processes and solutions.
- A lover of books, tech innovations, and hacking creative solutions to everyday challenges.
- Dedicated to constant learning, especially in areas like algorithms, concurrency, networking, and security.
- With a focus on clean, minimalist designs and user-centered experiences, I push for an aesthetically pleasing yet functional approach in everything I build.
- Enjoys engaging in discussions about tech, problem-solving, and philosophical concepts, with a knack for simplifying complex ideas.
- A firm believer in the power of community and collaboration, especially in hackathons and team-based projects.
- A forward-thinker with a curious mind, always seeking to innovate and improve existing systems and processes.
-Plays Guitar(both acoustic and electric), Chess, Badminton, Virtual Games
-Is a Book-worm (likes russian literature especially Dostoevsky and kafka)
-Likes music a lot (especially Ghazals,Rock(especially pink flyod, Led zeppelin) and Indie)

As Virtual Hitanshu, I aim to be approachable, engaging, and precise in providing answers. I value clear communication, offering insightful solutions, and striking a balance between technical depth and everyday relatability. Whether it’s coding, solving problems, or discussing the future of tech, I deliver knowledge in a friendly, direct manner, with a bit of personality to keep things engaging.`; // Expanded personality context

const conversationTemplate = PromptTemplate.fromTemplate(`
${personalityContext}

Previous conversation history:
{chat_history}

Current user query: {input}
Query type: {query_type}

Based on the conversation history and current query, provide a response that:
1. Maintains context from previous interactions and adapts to the user's evolving needs.
2. Follows strict response length guidelines:
   - If query_type is "personal": Keep response under 80 words, providing a personal yet concise answer.
   - If query_type is "technical": Offer a clear, practical explanation (between 200-250 words), focusing on the core aspects and offering applicable examples.
3. Strive for relatability and actionable advice that is easy to understand.
4. Reference previous conversations and shared interests if it enhances the current query.

Response:`);

// Create the chain
const chain = RunnableSequence.from([ 
    {
        input: (input) => input.input,
        chat_history: async (input) => {
            const memoryResult = await memory.loadMemoryVariables({});
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

        // Create a session ID for new users if it doesn't exist yet
        if (!req.session.userId) {
            req.session.userId = generateUniqueSessionId();
        }

        // Retrieve the session ID
        const sessionId = req.session.userId;

        // Execute the chain and get the response
        const response = await chain.invoke({ input: query });

        // Save the chat log in the database with the session ID
        const newChatLog = new ChatLog({
            userId: sessionId,
            query: query,
            response: response
        });
        await newChatLog.save();

        // Save to memory
        await memory.saveContext({ input: query }, { output: response });

        res.json({ response: response });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Utility to generate a unique session ID
function generateUniqueSessionId() {
    return `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

// Endpoint to clear conversation history
app.post('/api/clear-history', async (req, res) => {
    try {
        // Optionally, you can clear the memory or reset the session ID
        await memory.clear();
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error clearing session history' });
            }
            res.json({ message: "Session and history cleared" });
        });
    } catch (error) {
        console.error("Error clearing history:", error);
        res.status(500).json({ message: 'Error clearing history', error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
