// routes/chatBotRoutes.js
import express from 'express';
import { getChatBotResponse } from '../controllers/chatbot.controller.js';
import { verifyToken } from '../Middleware/auth.js';

const router = express.Router();

// POST /api/chatbot/message - Get AI response for financial queries
router.post('/message', verifyToken, getChatBotResponse);

export default router;