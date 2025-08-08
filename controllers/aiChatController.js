import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Chat response controller
export const getAIResponse = async (req, res) => {
  try {
    const { userMessage, context } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }

    let systemPrompt = `You are FinBot, a friendly financial education tutor. You help users learn about finance through engaging conversations.

Rules:
1. Keep responses conversational and engaging
2. Provide practical examples when explaining concepts
3. If user asks about learning tracks, suggest they browse available options
4. If user wants to continue a specific track, guide them to the learning content
5. Always be encouraging and supportive
6. Keep responses under 200 words for chat interface`;

    if (context) {
      systemPrompt += `\n\nContext: ${JSON.stringify(context)}`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiMessage = response.choices[0].message.content;

    res.status(200).json({
      success: true,
      message: aiMessage
    });

  } catch (error) {
    console.error('OpenAI API error:', error);

    const fallbackMessage = "I'm here to help you learn about finance! You can ask me questions about financial topics, start a new learning track, or continue with your current progress. What would you like to explore today?";

    res.status(200).json({
      success: true,
      message: fallbackMessage,
      fallback: true
    });
  }
};

// AI learning content generation controller
export const getAILearningContent = async (req, res) => {
  try {
    const { dayData } = req.body;

    if (!dayData || !dayData.topic || !dayData.content) {
      return res.status(400).json({ error: 'Day data with topic and content is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a financial education tutor. Explain the given topic in a clear, engaging way with practical examples. Make it interactive and easy to understand. End with encouraging the user to take the quiz when they feel ready.'
        },
        {
          role: 'user',
          content: `Teach me about: "${dayData.topic}"\n\nBase content: ${dayData.content}\n\nMake this engaging and include real-world examples.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const enhancedContent = response.choices[0].message.content;

    res.status(200).json({
      success: true,
      content: enhancedContent
    });

  } catch (error) {
    console.error('OpenAI API error:', error);

    const fallbackContent = `**${req.body.dayData?.topic || 'Learning Content'}**\n\n${req.body.dayData?.content || 'Content not available'}\n\nThis is a fundamental concept in finance. Take your time to understand it, and when you're ready, let me know if you'd like to take the quiz!`;

    res.status(200).json({
      success: true,
      content: fallbackContent,
      fallback: true
    });
  }
};
