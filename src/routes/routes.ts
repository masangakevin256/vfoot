import express from "express";
import { userRoutes } from "./userRoutes";
import { LoginRouter } from "./login";


export const router = express.Router();

//user routes
router.use('/users', userRoutes);

//login routes
router.use('/login', LoginRouter);