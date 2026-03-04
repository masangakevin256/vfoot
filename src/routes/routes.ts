import express from "express";
import { userRoutes } from "./userRoutes";


export const router = express.Router();

//user routes
router.use('/users', userRoutes);