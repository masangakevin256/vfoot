import express from "express";
import { LoginUser } from "../controller/controlLogin";

export const LoginRouter = express.Router();

LoginRouter.post("/auth/user", LoginUser);