import { validationResult } from "express-validator";
import language from "../languages/english.js";

export const trapErrors = (req, res, next) => {

    const result = validationResult(req);
    const merged = [...result.array()];

    if (req.fileError) merged.push(req.fileError);

    if (req.fileValidationError && typeof req.fileValidationError === "object") {
        Object.entries(req.fileValidationError).forEach(([path, msg]) => {
            merged.push({ path, msg: String(msg), type: "field" });
        });
    }

    if (merged.length) {
        const errJson = merged.filter((row) => row.path).reduce((acc, row) => {
            acc[row.path] = row.msg;
            return acc;
        }, {});

        return res.status(422).json({
            status: false,
            message: language.REQUIRED_PARAMETER_MISSING,
            data: errJson // errors.array()
        });
    }

    next();
};