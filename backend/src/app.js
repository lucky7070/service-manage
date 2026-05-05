import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from 'url';
import { config } from "./config/index.js";
import routes from "./routes/index.js";
import { customMethods } from "./middlewares/customMethods.js";
import { licenseCheck } from "./middlewares/licenseCheck.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(customMethods);
app.get("", (req, res) => res.success([], `Backend is healthy..!! ✅`));
app.use(licenseCheck);

const uploadsDir = path.resolve("./public/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use("/uploads", express.static(uploadsDir));
app.all('/uploads/*', (req, res) => res.sendFile(path.resolve(__dirname, '../public/uploads/img-not-found.jpg')));

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
