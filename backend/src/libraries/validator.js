import { check, param } from "express-validator";
import { BANNER_TYPES, PHONE_REGEXP, SERVICE_PROVIDER_PROFILE_STATUSES } from "../config/constants.js";
import { trapErrors } from "../middlewares/trapErrors.js";

const email = check("email", "Valid email is required.").exists().notEmpty().isEmail().isLength({ min: 2, max: 100 }).trim().normalizeEmail().toLowerCase();
const password = check("password", "Password must be greater then 5 digit.!!").exists().notEmpty().isLength({ min: 5, max: 50 }).trim();
const name = check("name", "Name is required.").exists().notEmpty().isLength({ min: 2, max: 100 }).trim();
const status = check("status", "Status is required.").exists().notEmpty().isIn([0, 1]);
const mobile = check("mobile", "Enter a valid Indian mobile number.").trim().notEmpty().matches(PHONE_REGEXP).withMessage("Enter a valid Indian mobile number.").isInt().customSanitizer(value => String(value)).isLength({ min: 10, max: 10 }).withMessage('mobile must be exactly 10 digits').trim();
const roleId = check("roleId", "Role ID is required.").exists().notEmpty().isMongoId();
const countryId = check("countryId", "Country ID is required.").exists().notEmpty().isMongoId();
const stateId = check("stateId", "State ID is required.").exists().notEmpty().isMongoId();
const settingType = param("type", "Setting type is invalid.").exists().notEmpty().isInt({ min: 1, max: 10 });

const dateOfBirth = check("dateOfBirth", "Date of birth must be YYYY-MM-DD.").exists().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/);
const customerStatus = check("status", "Status is required.").exists().notEmpty().isIn([0, 1, "0", "1"]);

const tagFor = check("tagFor", "Tag for is required.").exists().notEmpty().isIn(["customer", "provider"]);
const tagName = check("tagName", "Tag name is required.").exists().notEmpty().isLength({ min: 1, max: 100 }).trim();
const tagType = check("tagType", "Tag type is required.").exists().notEmpty().isIn(["positive", "negative", "neutral"]);

const categoryIdService = check("categoryId", "Category is required.").exists().notEmpty().isMongoId();
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

const experienceDescriptionProvider = check("experienceDescription").optional({ values: "falsy" }).isLength({ max: 5000 }).trim();
const profileStatusProviderRequired = check("profileStatus", "Profile status is required.").exists().notEmpty().isIn(SERVICE_PROVIDER_PROFILE_STATUSES);
const isVerifiedProvider = check("isVerified", "isVerified must be 0 or 1.").exists().notEmpty().isIn([0, 1, "0", "1", true, false, "true", "false"]);
const isResolved = check("isResolved", "isResolved must be 0 or 1.").exists().notEmpty().isIn([0, 1, "0", "1", true, false, "true", "false"]);
const objectIdParam = param("id", "Invalid ID.").exists().notEmpty().isMongoId();
const passwordOptional = check("password", "Password must be greater then 5 digit.!!").optional({ nullable: true }).isLength({ min: 5, max: 50 });
const imageRequired = check("image", "Profile image is required.").custom((value, { req }) => {
    if (!req.file) throw new Error("Profile image is required.");
    return true;
});

const resetToken = check("resetToken", "Reset token is required.").trim().notEmpty();
const otp = check("otp", "Enter the 6-digit code.").trim().notEmpty().matches(/^[0-9]{6}$/).withMessage("OTP must be 6 digits.");
const currentPassword = check("current_password", "Current password must be 8–50 characters.").trim().notEmpty().isLength({ min: 8, max: 50 });
const newPassword = check("new_password", "New password must be 8–50 characters.").trim().notEmpty().isLength({ min: 8, max: 50 });
const confirmPassword = check("confirm_password", "Please confirm your new password.").trim().notEmpty().custom((value, { req }) => {
    if (value !== req.body.new_password) throw new Error("New password and confirmation do not match.");
    return true;
})
const question = check("question", "Question is required.").trim().notEmpty().isLength({ min: 3, max: 2000 });
const answer = check("answer", "Answer is required.").trim().notEmpty().isLength({ min: 3, max: 10000 });
const displayOrder = check("displayOrder", "Display order must be numeric.").optional({ values: "falsy" }).isInt({ min: 0, max: 999999 });
const bannerType = check("bannerType", "Banner type is required.").optional({ values: "falsy" }).isIn(BANNER_TYPES);
const bannerLink = check("link", "Invalid link.").optional({ values: "falsy" }).isLength({ max: 500 }).trim();
const pageSlug = check("pageSlug", "Page slug is required.").trim().notEmpty().isLength({ min: 2, max: 150 }).matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const pageTitle = check("pageTitle", "Page title is required.").trim().notEmpty().isLength({ min: 2, max: 255 });
const pageTitleHi = check("pageTitleHi").optional({ values: "falsy" }).isLength({ max: 255 }).trim();
const metaDescription = check("metaDescription").optional({ values: "falsy" }).isLength({ max: 5000 }).trim();
const metaKeywords = check("metaKeywords").optional({ values: "falsy" }).isLength({ max: 5000 }).trim();
const content = check("content").optional({ values: "falsy" }).isLength({ max: 200000 }).trim();
const contentHi = check("contentHi").optional({ values: "falsy" }).isLength({ max: 200000 }).trim();
const viewCount = check("viewCount", "View count must be 0 or greater.").optional({ values: "falsy" }).isInt({ min: 0 });

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
        case "admin-forgot-password":
            output = [email];
            break;
        case "admin-forgot-password-reset":
            output = [
                email, otp,
                newPassword.custom((value, { req }) => {
                    if (value === req.body.current_password) throw new Error("New password must be different from your current password.");
                    return true;
                }),
                confirmPassword
            ];
            break;
        case "admin-profile-password":
            output = [currentPassword, newPassword, confirmPassword];
            break;
        case "faq":
            output = [question, answer, customerStatus, displayOrder];
            break;
        case "banner":
            output = [bannerType, bannerLink, displayOrder];
            break;
        case "enquiry-resolve":
            output = [objectIdParam, isResolved];
            break;
        case "cms-page":
            output = [pageSlug, pageTitle, pageTitleHi, metaDescription, metaKeywords, content, contentHi, viewCount];
            break;
        case "setting-update":
            output = [settingType];
            break;
        default:
            output = [];
    }

    return [...output, trapErrors];
};
