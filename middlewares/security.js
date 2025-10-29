import hpp from "hpp";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import express from "express";
import { config } from "dotenv";

config();

const securityMiddleware = (app) => {
  // trust proxy
  app.set("trust proxy", 1);
  // logger
  process.env.NODE_ENV = "development"
    ? app.use(morgan("dev"))
    : app.use(morgan("combined"));
  // body parser
  app.use(express.json({ limit: "10kb" }));
  // security headers
  app.use(helmet());
  // enable cors
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    })
  );
  // prevent http parameter pollution
  app.use(hpp());
};

export default securityMiddleware;
