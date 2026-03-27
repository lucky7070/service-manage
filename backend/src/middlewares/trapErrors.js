import { validationResult } from "express-validator";
import language from "../languages/english.js";

export const trapErrors = (req, res, next) => {

    // Fetch Express Validation Errors
    const errors = validationResult(req);

    console.log({ errors });

    // Append File validation Error
    if (req.fileError) errors.errors.push(req.fileError);

    // Format Express Validation Errors
    if (!errors.isEmpty()) {
        const errJson = errors.errors.filter(row => row.path).reduce((acc, row) => {
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