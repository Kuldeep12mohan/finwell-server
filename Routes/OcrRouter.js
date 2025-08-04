// server/routes/ocr.js
import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const OcrRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o'; // or 'gpt-4-vision-preview'

OcrRouter.post('/', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const systemPrompt = `You are a smart financial assistant that extracts structured data from receipts.
Return a JSON object with the following keys:
- amount (number, total paid)
- date (ISO yyyy-mm-dd format)
- merchant (store name)
- description (same as merchant or brief text)
- category (one of: FOOD, SHOPPING, UTILITIES, ENTERTAINMENT, TRANSPORTATION, EDUCATION, INVESTMENT, OTHERS)
Only respond with valid JSON.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract transaction details from this receipt image and return only JSON.',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ];

    const body = {
      model: OPENAI_MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 500,
    };

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', errText);
      return res.status(500).json({ error: 'OpenAI API error', detail: errText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Try to extract clean JSON from content
    let parsed = null;
    try {
      const cleaned = content.replace(/```json\s*([\s\S]*?)```/, '$1').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.warn('Failed to parse JSON from response. Returning raw text.');
    }

    if (!parsed) {
      return res.json({ raw: content });
    }

    // Normalize output
    parsed.amount = Number(parsed.amount || 0);
    parsed.date = parsed.date || new Date().toISOString().split('T')[0];
    parsed.merchant = parsed.merchant || parsed.description || '';
    parsed.description = parsed.description || parsed.merchant;
    parsed.category = parsed.category || 'OTHERS';

    res.json({ transaction: parsed, raw: content });
  } catch (err) {
    console.error('OCR route error:', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

export default OcrRouter;
