const mongoose = require('mongoose');

// Define the schema for storing chat queries and AI responses
const chatSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create the model based on the schema
const ChatLog = mongoose.model('ChatLog', chatSchema);

module.exports = ChatLog;
