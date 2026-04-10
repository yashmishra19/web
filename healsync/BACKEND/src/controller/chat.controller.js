const userModel = require("../models/user.model");
const chatMessageModel = require("../models/chat.model");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

const apiKey = process.env.AI_CHATBOT;
const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

async function callGemini(contents, userContext) {
  if (!apiKey) {
    throw new Error("AI_CHATBOT key is not configured in .env");
  }

  if (typeof fetch !== "function") {
    throw new Error("Fetch is not available in this Node version. Use Node 18+.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  
  const systemInstructionText = `You are Healsync's AI assistant, focusing on personalized health recommendations and continuous mental wellbeing support. ${userContext}`;

  const body = {
    contents: contents, // already an array of { role, parts }
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data.error?.message || data.error?.status || response.statusText;
    throw new Error(`Gemini API error: ${error}`);
  }

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I could not read the AI response."
  );
}

// Background Task definition
async function extractKeyPoints(userId, newMessage) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const prompt = `Analyze the user's latest statement: "${newMessage}". 
Does it contain any new, important, factual information about their health, lifestyle, or personal preferences (e.g., medical conditions, allergies, pets, family, age, fitness routine)?
If yes, return a flat JSON array of strings, where each string is a distinct fact.
If no new facts are present, return exactly []. Do not include any formatting or markdown blocks. Only output raw JSON array.`;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
      }
    };
    
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    let resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    let extracted = [];
    try {
      // clean up any markdown blocks if the model ignored instructions
      resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      extracted = JSON.parse(resultText);
    } catch(e) {
      console.log("Failed to parse JSON extracted points:", resultText);
    }

    if (Array.isArray(extracted) && extracted.length > 0) {
      await userModel.findByIdAndUpdate(userId, {
        $push: { keyPoints: { $each: extracted } }
      });
      console.log(`Saved new key points for user ${userId}:`, extracted);
    }
  } catch (err) {
    console.error("Key point extraction error:", err.message);
  }
}

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message is required." });
    }

    let userContext = "You are talking to an anonymous guest user.";
    let contents = [];
    let activeUser = null;

    if (req.cookies && req.cookies.token) {
      const token = req.cookies.token;
      const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
      
      if (!isTokenBlacklisted) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_SECRET_KEY);
          activeUser = await userModel.findById(decoded.id);
          
          if (activeUser) {
            // Build Context string with KeyPoints
            let pointsContext = activeUser.keyPoints && activeUser.keyPoints.length > 0 
                ? ` Their remembered traits/facts are: ${activeUser.keyPoints.join(", ")}.` 
                : "";

            userContext = `The user you are talking to is named "${activeUser.username}" and their email is "${activeUser.email}".${pointsContext} Address them by their name when appropriate and contextualize your answers based on their profile facts.`;

            // Fetch History (last 20 messages)
            const historyObj = await chatMessageModel.find({ userId: activeUser._id }).sort({ timestamp: 1 }).limit(20);
            
            // Map history to Gemini format
            contents = historyObj.map(h => ({
              role: h.role, 
              parts: [{ text: h.text }]
            }));
          }
        } catch (err) {
          console.log("Token verification failed in chat:", err.message);
        }
      }
    }

    // Append the new message
    contents.push({ role: "user", parts: [{ text: message }] });

    // Call Gemini
    const reply = await callGemini(contents, userContext);

    // Save strictly if it's a logged-in user
    if (activeUser) {
      await chatMessageModel.create({ userId: activeUser._id, role: "user", text: message });
      await chatMessageModel.create({ userId: activeUser._id, role: "model", text: reply });

      // Run background key point extraction without awaiting
      extractKeyPoints(activeUser._id, message);
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate a chat reply.",
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    if (!req.cookies || !req.cookies.token) {
       return res.status(401).json({ error: "Unauthorized" });
    }
    const token = req.cookies.token;
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isTokenBlacklisted) return res.status(401).json({ error: "Invalid Token" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_SECRET_KEY);
    const history = await chatMessageModel.find({ userId: decoded.id }).sort({ timestamp: 1 });

    res.status(200).json({ history });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};
