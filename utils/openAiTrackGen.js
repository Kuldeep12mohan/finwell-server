// utils/openaiTrackGen.js
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY  });

export async function getAITrack(interest, difficulty) {
  const systemPrompt = `
You are an expert finance educator. Generate a ${difficulty}-level 7-day learning track on "${interest}".
Each day must include:
- dayNumber (1–7)
- topic title
- a 3-5 sentence content lesson
- a short quiz with exactly 2 MCQs (each MCQ should have 4 options and 1 correct answer)

Respond ONLY in strict JSON format:
{
  "title": "...",
  "description": "...",
  "difficulty": "...",
  "days": [
    {
      "dayNumber": 1,
      "topic": "...",
      "content": "...",
      "quiz": {
        "questions": [
          {
            "question": "...",
            "options": ["...", "...", "...", "..."],
            "answer": "..."
          },
          ...
        ]
      }
    },
    ...
  ]
}
`;


  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate the learning track." }
    ],
    model: "gpt-4-0613",
    temperature: 0.7,
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  console.log("here",parsed)
  return parsed;
}

getAITrack("investment","hard")
