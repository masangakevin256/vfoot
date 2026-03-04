import express from "express";
import { getAllUsers, googleAuthController, registerController } from "../controller/controlUsers";

export const userRoutes = express.Router();

userRoutes.get('/', getAllUsers);
userRoutes.post('/', registerController);
userRoutes.post("/auth/google", googleAuthController);