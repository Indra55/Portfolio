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

// Store memories for each user session
const userMemories = new Map();

const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_AI_KEY
});

// Function to get or create memory for a specific user
function getUserMemory(sessionId) {
    if (!userMemories.has(sessionId)) {
        userMemories.set(sessionId, new BufferMemory({
            returnMessages: true,
            memoryKey: "chat_history",
            inputKey: "input",
            outputKey: "output",
        }));
    }
    return userMemories.get(sessionId);
}

// Clean up old memories periodically
setInterval(() => {
    const oneHourAgo = Date.now() - 3600000;
    for (const [sessionId, memoryData] of userMemories.entries()) {
        if (memoryData.lastAccessed < oneHourAgo) {
            userMemories.delete(sessionId);
        }
    }
}, 15 * 60 * 1000); // Run every 15 minutes

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
})
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error("Error connecting to DB", err));

const personalityContext = `# I'm Hitanshu...`; // Your existing personality context

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
    - And don't force my non-technical intrests in every chat just state them when asked or they are really necessary
    -if anyone asks for my projects you can state them form this data:
    projectData = [
        """{
          title: "Read Wise",
          description: "A Book Recommendation Platform",
          image: readwise,
          longDescription: "",
          technologies: ["Python", "Streamlit", "Pandas", "Plotly"],
          website: "https://readwiser.streamlit.app/",
          github: "https://github.com/Indra55/book_recommendation_system_streamlit",
        },
        {
          title: "Katha Kritique",
          description: "A Book Review Website",
          image: kk,
          longDescription: [
            "Leverages Google's Generative AI to generate initial book reviews based on user-provided titles and word counts.",
            "Empowers users to refine and personalize the AI-generated drafts, adding their own insights and perspectives.",
            "Provides a platform for users to publish their reviews and engage in discussions about literature.",
            "Built using the MERN stack (MongoDB, Express.js, React.js, Node.js) for a robust and scalable architecture.",
          ],
          technologies: ["React", "Express.js", "Node.js", "MongoDB", "Google Generative AI"],
          website: "https://katha-kritique.vercel.app",
          github: "https://github.com/Indra55/Katha-Kritique/",
        },
        {
          title: "AutoEstimatr",
          description: "A web app to predict used car prices.",
          image: aes,
          longDescription: [
            "Uses a pre-trained Linear Regression model to estimate used car prices.",
            "Collects user input for car company, model, year, fuel type, and kilometers driven.",
            "Processes the input data and generates a price prediction.",
            "Built with Python and the Flask web framework.",
          ],
          technologies: ["Python", "Flask", "Pandas", "Pickle", "NumPy", "HTML", "CSS"],
          website: "https://autoestimatr.onrender.com/",
          github: "https://github.com/Indra55/AutoEstimatr/",
        },
        {
          title: "GitFind",
          description: "GitHub profile search tool",
          image: gitfnd,
          longDescription: ["A web app to search and explore GitHub profiles, repositories, followers, and more, with an easy-to-use interface."],
          technologies: ["HTML", "CSS", "JavaScript"],
          website: "https://git-find-omega.vercel.app/",
          github: "https://github.com/Indra55/Git_Find"
        },
        {
          title: "Nirvana AI",
          description: "AI-driven mental health support chatbot",
          image: nirvanaai,
          longDescription: [
            "Nirvana AI is a chatbot designed to provide empathetic and intelligent conversations to support users dealing with mental health issues. It offers real-time guidance, emotional support, and helpful resources."
          ],
          technologies: ["React.js", "Node.js", "Express", "MongoDB", "Google Generative AI"],
          website: "https://nirvana-ai.vercel.app/",
          github: "https://github.com/Indra55/nirvana-ai"
        },
        {
          title: "Cold Connect",
          description: "AI-powered cold email generator with resume parsing and job data extraction.",
          image: coldconnect,
          longDescription: [
            "Cold Connect is a web app that simplifies cold emailing for job applications by extracting job descriptions directly from URLs and generating personalized emails. It parses PDF resumes to pull relevant details like skills and experience, aligning them with job requirements to craft tailored emails."
          ],
          technologies: ["Streamlit", "Python", "LangChain", "Spacy", "PyPDF2", "Llama 3"],
          website: "https://coldconnect.app",
          github: "https://github.com/Indra55/Cold-Email-Generator"
        }"""
    
    My response:`
);

// Create chain factory function for each user
function createUserChain(sessionId) {
    const userMemory = getUserMemory(sessionId);
    
    return RunnableSequence.from([
        {
            input: (input) => input.input,
            chat_history: async (input) => {
                const memoryResult = await userMemory.loadMemoryVariables({});
                return memoryResult.chat_history || "No previous conversation.";
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
}

app.post('/api/chat', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ message: "Please input something" });
        }

        let sessionId = req.cookies.userId;
        if (!sessionId) {
            sessionId = generateUniqueSessionId();
            res.cookie('userId', sessionId, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 3600000 
            });
        }

        const userChain = createUserChain(sessionId);
        const userMemory = getUserMemory(sessionId);

        const response = await userChain.invoke({ input: query });

        const newChatLog = new ChatLog({
            userId: sessionId,
            query: query,
            response: response
        });
        await newChatLog.save();

        // Save to user-specific memory
        await userMemory.saveContext({ input: query }, { output: response });
        
        // Update last accessed timestamp
        userMemories.get(sessionId).lastAccessed = Date.now();

        res.json({ response: response });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/clear-history', async (req, res) => {
    try {
        const sessionId = req.cookies.userId;
        if (sessionId) {
            userMemories.delete(sessionId);
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