const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
};

app.use(express.json());
app.use(cors(corsOptions));

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

// Connect to MongoDB with timeout settings
mongoose.connect(process.env.MONGODB_URI, { 
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
    socketTimeoutMS: 10000,         // 10 seconds timeout for socket operations
})
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error("Error connecting to DB", err));

// Define the personality context
const personalityContext = `# Virtual Hitanshu: Technical Expert & Renaissance Developer
...`;

// Define a function to classify query type
const queryClassificationTemplate = PromptTemplate.fromTemplate(`
Analyze if the following query is personal or technical/career-oriented:
Query: {input}

Respond with only one word: "personal" or "technical"

Classification:`);

// Define the conversation template with length constraints
const conversationTemplate = PromptTemplate.fromTemplate(`
${personalityContext}

Previous conversation history:
{chat_history}

Current user query: {input}
Query type: {query_type}

Based on the conversation history and current query, provide a response that:
1. Maintains context from previous interactions
2. Adheres strictly to the response length guidelines:
   - If query_type is "personal": Keep response under 150 words
   - If query_type is "technical": Keep response between 300-350 words
3. Addresses technical aspects if relevant
4. References previous conversation when appropriate

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
            queryClassificationTemplate,
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

        // Execute the chain
        const response = await chain.invoke({
            input: query
        });

        // Save to memory
        await memory.saveContext(
            { input: query },
            { output: response }
        );

        // Save the chat log
        const newChatLog = new ChatLog({
            query: query,
            response: response
        });
        await newChatLog.save();

        res.json({ response: response });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint to clear conversation history
app.post('/api/clear-history', async (req, res) => {
    try {
        await memory.clear();
        res.json({ message: "Conversation history cleared" });
    } catch (error) {
        console.error("Error clearing history:", error);
        res.status(500).json({ message: 'Error clearing history', error: error.message });
    }
});

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!process.env.GOOGLE_AI_KEY) {
        console.warn("WARNING: Issues with Google Generative AI");
    }
});
