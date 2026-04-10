const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'model'], 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const chatMessageModel = mongoose.model("chats", chatMessageSchema);
module.exports = chatMessageModel;
