import express from "express";
import connector from "./database/connector.js";
import RouteServiceProvider from "./app/providers/RouteServiceProvider.js";
import notFound from "./app/middleware/not-found.js";
import errorHandlerMiddleware from "./app/middleware/error-handler.js";
import expressAsycErrors from "express-async-errors";
import expressValidator from "express-validator";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import RateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class App {
  constructor() {
    dotenv.config();
    this.server = express();
    this.middlewares();
    this.routes();
    this.server.use(notFound);
    this.server.use(errorHandlerMiddleware);
  }

  middlewares() {
    this.server.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
    this.server.use(cors());

    this.server.use(xss());
    this.server.use(
      RateLimit({
        windowMs: 60 * 1000,
        max: 100,
      })
    );

    this.server.use(express.static("client/build"));

    this.server.use((req, res, next) => {
      if (!req.url.startsWith("/api")) {
        res.sendFile(path.join(__dirname, "client/build", "index.html"));
      } else {
        next();
      }
    });
    this.server.use(express.json());
    // this.server.use(expressValidator());
  }

  routes() {
    new RouteServiceProvider(this.server);
  }
}

var server = new App().server;

var port = process.env.PORT || 3000;

connector
  .mongo()
  .then((result) => {
    server.listen(port, () => {
      console.log(
        `Started Express server at port ${port}... \n you can run it clicking this link http://localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.error(`Failed to connect to DB ${err}`);
  });
