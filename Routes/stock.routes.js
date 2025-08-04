import express from 'express';
import axios from 'axios';
import { verifyToken } from '../Middleware/auth.js';
import { generateToken } from '../Middleware/auth.js';
import { getAll } from '../controllers/user.controller.js';
import  User  from '../models/User.js';
import { getStockOptions } from '../controllers/stockOptions.controller.js';
const stockRouter = express.Router();

stockRouter.post("/recommendations", verifyToken, getStockOptions);

export default stockRouter;
