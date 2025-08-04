import express from 'express';
import axios from 'axios';
import { verifyToken } from '../Middleware/auth.js';
import { generateToken } from '../Middleware/auth.js';
import { getAll } from '../controllers/user.controller.js';
import  User  from '../models/User.js';
import { getStockOptions } from '../controllers/stockOptions.controller.js';
import { completeDay, genTrack, getTracks } from '../controllers/trackController.js';
const learnRouter = express.Router();

learnRouter.post("/randomTracks", verifyToken, genTrack);
learnRouter.get("/allTracks",verifyToken,getTracks);
learnRouter.post("/complete-day",verifyToken,completeDay);

export default learnRouter;
