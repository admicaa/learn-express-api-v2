import { Router } from "express";
import jobsController from "../app/controllers/jobs.controller.js";
import authenticationMiddleware from "../app/middleware/authentication.js";

const routes = new Router();

// Add routes
routes.get("/", authenticationMiddleware, jobsController.index);
routes.get("/stats", authenticationMiddleware, jobsController.stats);
routes.get("/:id", authenticationMiddleware, jobsController.show);
routes.post("/", authenticationMiddleware, jobsController.store);
routes.patch("/:id", authenticationMiddleware, jobsController.update);
routes.delete("/:id", authenticationMiddleware, jobsController.destroy);
export default routes;
