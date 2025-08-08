import express from 'express';
import { verifyToken } from '../Middleware/auth.js';
import { getAILearningContent, getAIResponse } from '../controllers/aiChatController.js';

const aiRouter = express.Router();

// POST /api/ai/chat - Get AI response for user message
aiRouter.post('/chat', verifyToken, getAIResponse);

// POST /api/ai/learning-content - Generate enhanced learning content
aiRouter.post('/learning-content', verifyToken, getAILearningContent);

export default aiRouter;
