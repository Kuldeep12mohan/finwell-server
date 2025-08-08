import { OpenAI } from "openai";
import User from "../models/User.js";
// import e from "express";
// import Account from "../models/Account.model.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getStockOptions(req, res) {
  console.log("openai api key: ",process.env.OPENAI_API_KEY);
  try {
    const { userId } = req.user
    const { accountId } = req.body;
    const userData = await User.findById(userId)
    const accounts = userData.accounts;
    const account = accounts.filter((acc)=>{
        return acc.id == accountId
    })
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const prompt = `
You are an expert financial advisor. Based on the following user profile and account status, suggest 3 top Indian stock options to invest in now, tailored to their balance and risk tolerance.

- Name: ${userData.name}
- Age: ${userData.age || "unknown"}
- Risk Tolerance: ${userData.risk || "moderate"}
- Account Balance: ₹${account.balance}
- Investment Goal: ${userData.goal || "long-term growth"}

Provide striclty in the following format :
example: 
"suggestions": [
    {
      "name": "Apple Inc. (AAPL)",
      "reason": "Strong earnings performance and consistent dividend payouts.",
      "riskLevel": "Low",
      "type": "Blue-chip",
      "sector": "Technology"
    },
    {
      "name": "Tesla Inc. (TSLA)",
      "reason": "Growth potential in electric vehicle market.",
      "riskLevel": "Medium",
      "type": "Growth",
      "sector": "Automotive"
    },
    {
      "name": "Coinbase (COIN)",
      "reason": "Exposure to cryptocurrency market with regulated operations.",
      "riskLevel": "High",
      "type": "Speculative",
      "sector": "Finance"
    }


Respond in a bullet list.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const result = completion.choices[0].message.content;

    res.status(200).json({
      message: "AI-based stock suggestions generated successfully",
      suggestions: result,
    });

  } catch (err) {
    console.error("Error generating stock options", err);
    res.status(500).json({ message: err });
  }
}
