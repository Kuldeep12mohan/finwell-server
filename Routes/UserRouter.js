import express from "express";
import axios from "axios";
import { verifyToken } from "../Middleware/auth.js";
import { generateToken } from "../Middleware/auth.js";
import { getAll } from "../controllers/user.controller.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
const userRouter = express.Router();

userRouter.post("/submit", async (req, res) => {
  const { name, email, password, googleId, budgetPerMonth, investmentSkill } =
    req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const bankRes = await axios.post(
      "https://bank-server-1-3s50.onrender.com/link-bank",
      {
        name,
        email,
      }
    );

    const { accessToken, accounts, transactions } = bankRes.data;

    const txs = Array.isArray(transactions) ? transactions : [];

    const enrichedAccounts = (Array.isArray(accounts) ? accounts : []).map(
      (acct) => {
        const related = txs.filter(
          (t) =>
            (t.fromAccountId && t.fromAccountId === acct.id) ||
            (t.toAccountId && t.toAccountId === acct.id)
        );
        return {
          ...acct,
          transactions: related,
        };
      }
    );

    const newUser = new User({
      name,
      email,
      password: googleId ? undefined : await bcrypt.hash(password, 10),

      googleId: googleId || undefined,
      authProvider: googleId ? "google" : "local",
      access_token: accessToken,
      accounts: enrichedAccounts,
      budgetPerMonth,
      investmentSkill,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "User signed up and bank linked successfully",
      user: newUser,
      token: token,
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.authProvider === "local") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: "Signin successful",
      user,
      token,
    });
  } catch (err) {
    console.error("❌ Signin error:", err.message);
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
});

userRouter.post("/transaction", verifyToken, async (req, res) => {
  /**
   * Expects in body:
   *  fromAccountId: string (the account in the bank backend)
   *  category: string
   *  date: string (ISO-ish or human, will be normalized)
   *  amount: number
   *  description?: string
   */
  try {
    const userId = req.user.userId; // set by verifyToken middleware
    const { fromAccountId, category, date, amount, description } = req.body;

    if (!fromAccountId || !category || !date || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Load full user (not lean because we'll update)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure the account belongs to this user
    const matching = (user.accounts || []).find(
      (acct) => acct.id === fromAccountId
    );
    if (!matching) {
      return res
        .status(403)
        .json({ message: "Account does not belong to user" });
    }

    // Normalize the date; fallback to now if invalid
    let createdAt;
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      createdAt = parsed.toISOString();
    } else {
      createdAt = new Date().toISOString();
    }

    // Forward the transaction to the bank server
    const txPayload = {
      fromAccountId,
      category,
      amount,
      description: description || "",
      createdAt,
      userId: user._id.toString(),
    };

    const headers = {};
    if (user.access_token) {
      headers.Authorization = `Bearer ${user.access_token}`;
    }

    const bankTxResp = await axios.post(
      "https://bank-server-1-3s50.onrender.com/transactions",
      txPayload,
      { headers }
    );

    console.log("✅ Transaction forwarded to bank server:", bankTxResp.data);

    // Re-link bank to get fresh snapshot (accounts + transactions)
    const bankLinkRes = await axios.post(
      "https://bank-server-1-3s50.onrender.com/link-bank",
      {
        name: user.name,
        email: user.email,
      }
    );

    const { accessToken, accounts, transactions } = bankLinkRes.data;
    const txs = Array.isArray(transactions) ? transactions : [];

    // Rebuild enriched accounts (fresh, replacing previous)
    const enrichedAccounts = (Array.isArray(accounts) ? accounts : []).map(
      (acct) => {
        const related = txs.filter(
          (t) =>
            (t.fromAccountId && t.fromAccountId === acct.id) ||
            (t.toAccountId && t.toAccountId === acct.id)
        );
        return {
          ...acct,
          transactions: related,
        };
      }
    );

    // Update user in place
    user.access_token = accessToken;
    user.accounts = enrichedAccounts;
    await user.save();

    res.status(200).json({
      message: "Transaction forwarded and user bank snapshot refreshed",
      bankTransaction: bankTxResp.data,
      user,
    });
  } catch (err) {
    console.error("❌ Transaction error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Failed to forward transaction or refresh user",
      error: err.response?.data || err.message,
    });
  }
});

userRouter.post("/getAll", verifyToken, async (req, res) => {
  getAll(req, res);
});

export default userRouter;
