import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define log levels
const levels = {
    error: "ERROR",
    warn: "WARN",
    info: "INFO",
    debug: "DEBUG"
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the log file path
const logFilePath = path.join(__dirname, "../../public/logger/app.log");
fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

// Helper to format the log message
function formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level}: ${message}`;
}

// Logger function
const logger = {
    log: (level, message) => {
        if (!levels[level]) {
            throw new Error(`Invalid log level: ${level}`);
        }

        const formattedMessage = formatMessage(levels[level], String(message ?? ""));

        // Log to the console
        console.log(formattedMessage);

        // Append to the log file
        fs.appendFile(logFilePath, `${formattedMessage}\n`, (err) => {
            if (err) console.error("Failed to write to log file:", err);
        });
    },

    error: (message) => logger.log("error", message),
    warn: (message) => logger.log("warn", message),
    info: (message) => logger.log("info", message),
    debug: (message) => logger.log("debug", message)
};

export default logger;

