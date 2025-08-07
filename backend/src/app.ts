import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export async function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
  app.use(limiter);

  const openapiPath = path.join(process.cwd(), "src", "openapi.yaml");
  let spec: any = { openapi: "3.0.0", info: { title: "WMS API", version: "1.0.0" } };
  try {
    const content = fs.readFileSync(openapiPath, "utf-8");
    spec = yaml.load(content);
  } catch (e) {
    // fallback to base spec
  }
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

  const router = express.Router();
  registerRoutes(router);
  app.use("/api", router);

  app.use(errorHandler);

  return app;
}