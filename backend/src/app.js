import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import fs from "fs";
import morgan from "morgan";
import path from "path";
import { config } from "./config/index.js";
import routes from "./routes/index.js";
import { customMethods } from "./middlewares/customMethods.js";
import { licenseCheck } from "./middlewares/licenseCheck.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const app = express();
app.use(
    cors({
        origin: config.frontendUrl,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(customMethods);
app.use(licenseCheck);
app.get("/health", (req, res) => res.success({ ok: true }, "Backend is healthy"));

const uploadsDir = path.resolve("./public/uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
