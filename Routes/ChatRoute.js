// import express from 'express';
// import { ChatCompletionMessageParam, OpenAI } from 'openai';
// import ChatHistory from '../models/ChatHistory.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const Chatrouter = express.Router();

// Chatrouter.post('/chat', async (req, res) => {
//   const { userId, fromAccountId, message } = req.body;

//   if (!userId || !fromAccountId || !message) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   try {
//     // Prepare prompt
//     const systemPrompt = {
//       role: 'system',
//       content: 'You are FinBot, a helpful personal finance assistant.',
//     };

//     const userPrompt = {
//       role: 'user',
//       content: message,
//     };

//     // Get response from OpenAI
//     const completion = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [systemPrompt, userPrompt],
//     });

//     const aiResponse = completion.choices?.[0]?.message?.content?.trim() || 'No response.';

//     // Store in DB
//     await ChatHistory.findOneAndUpdate(
//       { userId, fromAccountId },
//       {
//         $push: {
//           messages: { sender: 'user', ai: message },
//           messages: { sender: 'bot', ai: aiResponse },
//         },
//       },
//       { upsert: true, new: true }
//     );

//     return res.status(200).json({ reply: aiResponse });
//   } catch (error) {
//     console.error('Chat error:', error.message);
//     res.status(500).json({ error: 'Something went wrong with the chat.' });
//   }
// });

// export default Chatrouter;
