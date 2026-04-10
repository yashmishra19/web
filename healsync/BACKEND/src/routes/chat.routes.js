const { Router } = require("express");
const chatController = require("../controller/chat.controller");
const chatRouter = Router();

/**
 * @route GET /api/chat/history
 * @description Load previous messages
 * @access Private
 */
chatRouter.get("/history", chatController.getChatHistory);

/**
 * @route POST /api/chat
 * @description Send a message to the AI chatbot
 * @access Private (or public depending on your auth setup)
 */
chatRouter.post("/", chatController.handleChat);

module.exports = chatRouter;
