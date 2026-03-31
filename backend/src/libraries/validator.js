import { check, param } from "express-validator";
import { PHONE_REGEXP, SERVICE_PROVIDER_PROFILE_STATUSES } from "../config/constants.js";
import { trapErrors } from "../middlewares/trapErrors.js";

const email = check("email", "Valid email is required.").exists().not().isEmpty().isEmail().isLength({ min: 2, max: 100 }).trim().toLowerCase();
const password = check("password", "Password must be greater then 5 digit.!!").exists().not().isEmpty().isLength({ min: 5, max: 50 });
const name = check("name", "Name is required.").exists().not().isEmpty().isLength({ min: 2, max: 100 }).trim();
const status = check("status", "Status is required.").exists().not().isEmpty().isIn([0, 1]);
const mobile = check("mobile", "Enter a valid Indian mobile number.").trim().notEmpty().matches(PHONE_REGEXP).withMessage("Enter a valid Indian mobile number.").isInt().customSanitizer(value => String(value)).isLength({ min: 10, max: 10 }).withMessage('mobile must be exactly 10 digits');
const roleId = check("roleId", "Role ID is required.").exists().not().isEmpty().isMongoId();
const countryId = check("countryId", "Country ID is required.").exists().not().isEmpty().isMongoId();
const stateId = check("stateId", "State ID is required.").exists().not().isEmpty().isMongoId();
const settingType = param("type", "Setting type is invalid.").exists().not().isEmpty().isInt({ min: 1, max: 10 });

const dateOfBirth = check("dateOfBirth", "Date of birth must be YYYY-MM-DD.").exists().not().isEmpty().matches(/^\d{4}-\d{2}-\d{2}$/);
const customerStatus = check("status", "Status is required.").exists().not().isEmpty().isIn([0, 1, "0", "1"]);

const tagFor = check("tagFor", "Tag for is required.").exists().not().isEmpty().isIn(["customer", "provider"]);
const tagName = check("tagName", "Tag name is required.").exists().not().isEmpty().isLength({ min: 1, max: 150 });
const tagType = check("tagType", "Tag type is required.").exists().not().isEmpty().isIn(["positive", "negative", "neutral"]);

const categoryIdService = check("categoryId", "Category is required.").exists().not().isEmpty().isMongoId();

const slugServiceCategory = check("slug", "Slug: use lowercase letters, numbers, and hyphens only.").optional({ values: "falsy" }).matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).isLength({ min: 2, max: 100 });
const nameHiCategory = check("nameHi").optional({ values: "falsy" }).isLength({ max: 200 });
const descriptionCategory = check("description").optional({ values: "falsy" }).isLength({ max: 5000 });
const displayOrderCategory = check("displayOrder").optional({ values: "falsy" }).isInt({ min: 0, max: 999999 });

const panCardNumberProvider = check("panCardNumber", "Valid PAN is required (e.g. ABCDE1234F).").trim().notEmpty().matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/).customSanitizer((v) => String(v).trim().toUpperCase());
const aadharNumberProvider = check("aadharNumber", "Aadhar must be exactly 12 digits.").trim().notEmpty().matches(/^[0-9]{12}$/);
const experienceYearsProvider = check("experienceYears").optional().custom((value) => {
    if (value === undefined || value === null || value === "") return true;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 80;
});

const experienceDescriptionProvider = check("experienceDescription").optional({ values: "falsy" }).isLength({ max: 5000 });
const profileStatusProvider = check("profileStatus").optional({ values: "falsy" }).isIn(SERVICE_PROVIDER_PROFILE_STATUSES);
const profileStatusProviderRequired = check("profileStatus", "Profile status is required.").exists().not().isEmpty().isIn(SERVICE_PROVIDER_PROFILE_STATUSES);
const isVerifiedProvider = check("isVerified", "isVerified must be 0 or 1.").exists().not().isEmpty().isIn([0, 1, "0", "1", true, false, "true", "false"]);
const objectIdParam = param("id", "Invalid ID.").exists().not().isEmpty().isMongoId();
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
        case "rating-tag":
            output = [tagFor, tagName, tagType, customerStatus];
            break;
        case "service-type":
            output = [categoryIdService, name, customerStatus];
            break;
        case "service-category":
            output = [name, customerStatus, slugServiceCategory, nameHiCategory, descriptionCategory, displayOrderCategory];
            break;
        case "service-provider":
            output = [name, mobile, email, panCardNumberProvider, aadharNumberProvider, experienceYearsProvider, experienceDescriptionProvider];
            break;
        case "service-provider-status":
            output = [objectIdParam, profileStatusProviderRequired, isVerifiedProvider];
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
