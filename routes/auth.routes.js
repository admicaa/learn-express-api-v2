import { Router } from "express";
import authController from "../app/controllers/auth.controller.js";

const routes = new Router();

routes.post("/register", authController.register);
routes.post("/login", authController.login);

export default routes;
