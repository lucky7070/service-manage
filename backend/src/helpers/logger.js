import fs from "fs";
import path from "path";
import moment from "moment";
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
const logFilePath = (fileName = 'app') => {
    const logFilePath = path.join(__dirname, `../../public/logger/${fileName}.log`);
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    return logFilePath;
}

// Helper to format the log message
function formatMessage(level, message) {
    const timestamp = moment().format();
    return `[${timestamp}] ${level}: ${message}`;
}

function normalizeContext(value) {
    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack
        };
    }

    return value;
}

function formatContext(context) {
    if (context === null || context === undefined) return "";

    try {
        return `\nContext: ${JSON.stringify(normalizeContext(context), null, 2)}`;
    } catch {
        return `\nContext: ${String(context)}`;
    }
}

// Logger function
const logger = {
    log: (level, message, context = null, fileName = 'app') => {
        if (!levels[level]) {
            throw new Error(`Invalid log level: ${level}`);
        }

        const formattedMessage = formatMessage(levels[level], String(message ?? ""));
        const formattedContext = formatContext(context);
        const logEntry = `${formattedMessage}${formattedContext}`;

        // Log to the console
        console.log(logEntry);

        // Append to the log file
        fs.appendFile(logFilePath(fileName), `${logEntry}\n`, (err) => {
            if (err) console.error("Failed to write to log file:", err);
        });
    },

    error: (message, context = null) => logger.log("error", message, context),
    warn: (message, context = null) => logger.log("warn", message, context),
    info: (message, context = null) => logger.log("info", message, context),
    debug: (message, context = null) => logger.log("debug", message, context),
    cron: (message, context = null) => logger.log("info", message, context, 'cron'),
    webhook: (message, context = null) => logger.log("info", message, context, 'webhook')
};

export default logger;