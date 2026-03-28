import { check, param } from "express-validator";
import { PHONE_REGEXP } from "../config/constants.js";
import { trapErrors } from "../middlewares/trapErrors.js";

const email = check("email", "Valid email is required.").exists().not().isEmpty().isEmail().isLength({ min: 2, max: 100 }).trim().toLowerCase();
const password = check("password", "Password must be greater then 5 digit.!!").exists().not().isEmpty().isLength({ min: 5, max: 50 });
const name = check("name", "Name is required.").exists().not().isEmpty().isLength({ min: 2, max: 100 });
const status = check("status", "Status is required.").exists().not().isEmpty().isIn([0, 1]);
const mobile = check("mobile", "Enter a valid Indian mobile number.").trim().notEmpty().matches(PHONE_REGEXP).withMessage("Enter a valid Indian mobile number.").isInt().customSanitizer(value => String(value)).isLength({ min: 10, max: 10 }).withMessage('mobile must be exactly 10 digits');
const roleId = check("roleId", "Role ID is required.").exists().not().isEmpty().isMongoId();
const countryId = check("countryId", "Country ID is required.").exists().not().isEmpty().isMongoId();
const stateId = check("stateId", "State ID is required.").exists().not().isEmpty().isMongoId();
const settingType = param("type", "Setting type is invalid.").exists().not().isEmpty().isInt({ min: 1, max: 10 });

const dateOfBirth = check("dateOfBirth", "Date of birth must be YYYY-MM-DD.").exists().not().isEmpty().matches(/^\d{4}-\d{2}-\d{2}$/);
const customerStatus = check("status", "Status is required.").exists().not().isEmpty().isIn([0, 1, "0", "1"]);

const passwordOptional = check("password", "Password must be greater then 5 digit.!!").optional({ nullable: true }).isLength({ min: 5, max: 50 });
const imageRequired = check("image", "Profile image is required.").custom((value, { req }) => {
    if (!req.file) throw new Error("Profile image is required.");
    return true;
});

export const validator = (method) => {

    let output = [];
    switch (method) {
        case "login":
            output = [email, password];
            break;
        case "forgot-password":
            output = [email];
            break;
        case "role":
            output = [name, status];
            break;
        case "country":
            output = [name, status];
            break;
        case "state":
            output = [countryId, name, status];
            break;
        case "city":
            output = [countryId, stateId, name, status];
            break;
        case "customer":
            output = [name, mobile, email, dateOfBirth, customerStatus];
            break;
        case "admin":
            output = [name, mobile, roleId, email, password, status];
            break;
        case "admin-update":
            output = [name, mobile, roleId, email, passwordOptional, status];
            break;
        case "admin-profile":
            output = [name, mobile, email];
            break;
        case "admin-profile-image":
            output = [imageRequired];
            break;
        case "setting-update":
            output = [settingType];
            break;
        default:
            output = [];
    }

    return [...output, trapErrors];
};
