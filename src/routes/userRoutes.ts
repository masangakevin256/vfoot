import express from "express";
import { getAllUsers } from "../controller/controlUsers";

export const userRoutes = express.Router();

userRoutes.get('/', getAllUsers);