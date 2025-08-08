import express from "express";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import userRouter from "./Routes/UserRouter.js";
import cors from "cors";
import OcrRouter from "./Routes/OcrRouter.js";
import stockRouter from "./Routes/stock.routes.js";
import learnRouter from "./Routes/Dailylearn.routes.js";
import aiRouter from "./Routes/aiChat.routes.js";
import chatBotRouter from "./Routes/chatbot.routes.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
connectDB();

app.use("/user", userRouter);
app.use("/ocr", OcrRouter);
app.use("/stocks", stockRouter);
app.use("/daily-learn", learnRouter);
app.use("/ai",aiRouter);
app.use("/chatbot",chatBotRouter)
// app.use('/chat',Chatrouter);

app.get("/", (req, res) => {
  res.send(" Server is running and DB is connected!");
});
app.head("/health", (req, res) => {
  res.set({
    "X-Service-Status": "ok",
    "X-Service-Uptime": process.uptime(),
    "X-Last-Check": new Date().toISOString(),
  });
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
