import { Router } from "express";
import * as usersController from "../controllers/usersController.js";

export const usersRouter = Router();

usersRouter.get("/", usersController.usersListGet);
usersRouter.get("/create", usersController.usersCreateGet);
usersRouter.post("/create", usersController.usersCreatePost);