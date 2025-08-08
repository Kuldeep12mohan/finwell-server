// controllers/chatBotController.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get AI response for financial queries with user context
export const getChatBotResponse = async (req, res) => {
  try {
    const { userMessage, userContext } = req.body;

    if (!userMessage) {
      return res.status(400).json({ 
        success: false, 
        error: 'User message is required' 
      });
    }

    // Build context string from user data
    const buildContextString = (context) => {
      if (!context) return "No user context available.";
      
      const acct = context.account || {};
      const txs = (acct.transactions || [])
        .map((t) => `${t.category}: ₹${t.amount} on ${t.date}`)
        .join(", ");

      return `
User name: ${context.name || "N/A"}
Monthly Budget: ₹${context.budgetPerMonth || "N/A"}
Account Balance: ₹${acct.balance || "N/A"}
Recent Transactions: ${txs || "None"}
      `.trim();
    };

    const contextString = buildContextString(userContext);

    const systemPrompt = `
You are FinBot, a helpful financial assistant.
Use the following user context to inform your answers:
${contextString}

Answer concisely and give actionable suggestions.
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.65,
      max_tokens: 500,
    });

    const botReply = response.choices[0].message.content || "No response generated.";

    res.status(200).json({
      success: true,
      message: botReply
    });

  } catch (error) {
    console.error('ChatBot API error:', error);
    
    // Provide a helpful fallback response
    let fallbackMessage = "❗ I'm having trouble processing your request right now. ";
    
    if (error.code === 'insufficient_quota') {
      fallbackMessage += "It seems like we've reached our API limit. Please try again later.";
    } else if (error.code === 'rate_limit_exceeded') {
      fallbackMessage += "Too many requests. Please wait a moment and try again.";
    } else {
      fallbackMessage += "Please try asking your question again, or contact support if the issue persists.";
    }
    
    res.status(200).json({
      success: true,
      message: fallbackMessage,
      fallback: true
    });
  }
};