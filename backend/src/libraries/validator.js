import { check, param } from "express-validator";
import { BANNER_TYPES, PHONE_REGEXP, SERVICE_PROVIDER_PROFILE_STATUSES } from "../config/constants.js";
import { trapErrors } from "../middlewares/trapErrors.js";

const email = check("email", "Valid email is required.").exists().notEmpty().isEmail().isLength({ min: 2, max: 100 }).trim().normalizeEmail().toLowerCase();
const password = check("password", "Password must be greater then 5 digit.!!").exists().notEmpty().isLength({ min: 5, max: 50 }).trim();
const name = check("name", "Name is required.").exists().notEmpty().isLength({ min: 2, max: 100 }).trim();
const status = check("status", "Status is required.").exists().notEmpty().isIn([0, 1, "0", "1"]);
const mobile = check("mobile", "Enter a valid Indian mobile number.").trim().notEmpty().matches(PHONE_REGEXP).withMessage("Enter a valid Indian mobile number.").isInt().customSanitizer(value => String(value)).isLength({ min: 10, max: 10 }).withMessage('mobile must be exactly 10 digits').trim();
const roleId = check("roleId", "Role ID is required.").exists().notEmpty().isMongoId();
const countryId = check("countryId", "Country ID is required.").exists().notEmpty().isMongoId();
const stateId = check("stateId", "State ID is required.").exists().notEmpty().isMongoId();
const settingType = param("type", "Setting type is invalid.").exists().notEmpty().isInt({ min: 1, max: 10 });
const phone = check("phone", "Enter a valid Indian mobile number.").optional({ values: "falsy" }).trim().matches(PHONE_REGEXP);
const subject = check("subject", "Subject must be 2–200 characters.").trim().notEmpty().isLength({ min: 2, max: 200 });
const slug = check("slug", "Slug: use lowercase letters, numbers, hyphens, and underscores only.").exists().notEmpty().matches(/^[a-z0-9_-]+$/).isLength({ min: 3, max: 60 }).withMessage("Slug must be 3 to 60 characters.").trim();
const message = check("message", "Message must be 10–5000 characters.").trim().notEmpty().isLength({ min: 10, max: 5000 });

const dateOfBirth = check("dateOfBirth", "Date of birth must be YYYY-MM-DD.").exists().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/);

const tagFor = check("tagFor", "Tag for is required.").exists().notEmpty().isIn(["customer", "provider"]);
const tagName = check("tagName", "Tag name is required.").exists().notEmpty().isLength({ min: 1, max: 100 }).trim();
const tagType = check("tagType", "Tag type is required.").exists().notEmpty().isIn(["positive", "negative", "neutral"]);

const categoryId = check("categoryId", "Category is required.").exists().notEmpty().isMongoId();
const slugOptional = check("slug", "Slug: use lowercase letters, numbers, and hyphens only.").optional({ values: "falsy" }).matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).isLength({ min: 2, max: 100 });
const nameHiCategory = check("nameHi").optional({ values: "falsy" }).isLength({ max: 200 });
const descriptionOptional = check("description").optional({ values: "falsy" }).isLength({ max: 5000 });

const panCardNumber = check("panCardNumber", "Valid PAN is required (e.g. ABCDE1234F).").trim().notEmpty().matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/).customSanitizer((v) => String(v).trim().toUpperCase());
const aadharNumber = check("aadharNumber", "Aadhar must be exactly 12 digits.").trim().notEmpty().matches(/^[0-9]{12}$/);
const experienceYears = check("experienceYears").optional().custom((value) => {
    if (value === undefined || value === null || value === "") return true;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 80;
});

const experienceDescription = check("experienceDescription").optional({ values: "falsy" }).isLength({ max: 5000 }).trim();
const profileStatus = check("profileStatus", "Profile status is required.").exists().notEmpty().isIn(SERVICE_PROVIDER_PROFILE_STATUSES);
const isVerified = check("isVerified", "isVerified must be 0 or 1.").exists().notEmpty().isIn([0, 1, "0", "1", true, false, "true", "false"]);
const isResolved = check("isResolved", "isResolved must be 0 or 1.").exists().notEmpty().isIn([0, 1, "0", "1", true, false, "true", "false"]);
const id = param("id", "Invalid ID.").exists().notEmpty().isMongoId();
const passwordOptional = check("password", "Password must be greater then 5 digit.!!").optional({ nullable: true }).isLength({ min: 5, max: 50 });
const imageRequired = check("image", "Profile image is required.").custom((value, { req }) => {
    if (!req.file) throw new Error("Profile image is required.");
    return true;
});

const otp = check("otp", "Enter the 6-digit code.").trim().notEmpty().matches(/^[0-9]{6}$/).withMessage("OTP must be 6 digits.");
const current_password = check("current_password", "Current password must be 8–50 characters.").trim().notEmpty().isLength({ min: 8, max: 50 });
const new_password = check("new_password", "New password must be 8–50 characters.").trim().notEmpty().isLength({ min: 8, max: 50 });
const confirm_password = check("confirm_password", "Please confirm your new password.").trim().notEmpty().custom((value, { req }) => {
    if (value !== req.body.new_password) throw new Error("New password and confirmation do not match.");
    return true;
})
const question = check("question", "Question is required.").trim().notEmpty().isLength({ min: 3, max: 2000 });
const answer = check("answer", "Answer is required.").trim().notEmpty().isLength({ min: 3, max: 10000 });
const displayOrder = check("displayOrder", "Display order must be numeric.").optional({ values: "falsy" }).isInt({ min: 0, max: 999999 });
const testimonialFrom = check("from", "Form must be customer or provider.").trim().notEmpty().isIn(["customer", "provider"]);
const designation = check("designation", "Designation is required.").trim().notEmpty().isLength({ min: 2, max: 100 });
const rating = check("rating", "Rating must be between 1 and 5.").exists().notEmpty().isFloat({ min: 1, max: 5 });
const review = check("review", "Review is required.").trim().notEmpty().isLength({ min: 3, max: 5000 });
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
const cityId = check("cityId", "City ID is required.").trim().notEmpty().isMongoId();
const serviceCategoryId = check("serviceCategoryId", "Service category is required.").trim().notEmpty().isMongoId();
const image = check("image", "Profile image is required.").custom((value, { req }) => {
    if (!req.params?.id && !req.files?.image?.[0]?.filename) throw new Error("Profile image is required.");
    return true;
});

const panCardDocument = check("panCardDocument", "PAN card document is required.").custom((value, { req }) => {
    if (!req.params?.id && !req.files?.panCardDocument?.[0]?.filename) throw new Error("PAN card document is required.");
    return true;
});

const aadharDocument = check("aadharDocument", "Aadhar document is required.").custom((value, { req }) => {
    if (!req.params?.id && !req.files?.aadharDocument?.[0]?.filename) throw new Error("Aadhar document is required.");
    return true;
});
const ourValueIconRequired = check("icon", "Icon image is required.").custom((value, { req }) => {
    if (!req.file?.filename) throw new Error("Icon image is required.");
    return true;
});
const title = check("title", "Title is required.").trim().notEmpty().isLength({ min: 2, max: 200 });
const description = check("description", "Description is required.").trim().notEmpty().isLength({ min: 3, max: 5000 });
const year = check("year", "Year is required.").trim().notEmpty().isLength({ min: 4, max: 4 });
const event = check("event", "Event is required.").trim().notEmpty().isLength({ min: 3, max: 5000 });

const addressId = param("addressId", "Invalid address ID.").exists().notEmpty().isMongoId();
const addressLine1 = check("addressLine1", "Address line 1 is required.").trim().notEmpty().isLength({ min: 2, max: 100 });
const addressLine2 = check("addressLine2", "Address line 2 is required.").trim().notEmpty().isLength({ min: 2, max: 100 });
const landmark = check("landmark").optional({ values: "falsy" }).trim().isLength({ max: 200 });
const addressState = check("state", "State is required.").trim().notEmpty().isMongoId();
const addressCity = check("city", "City is required.").trim().notEmpty().isMongoId();
const pincode = check("pincode", "Pincode must be 6 digits.").trim().notEmpty().matches(/^\d{6}$/);
const latitude = check("latitude", "Latitude must be numeric.").optional({ values: "falsy" }).isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90.");
const longitude = check("longitude", "Longitude must be numeric.").optional({ values: "falsy" }).isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180.");
const locationType = check("locationType", "Invalid location type.").optional({ values: "falsy" }).isIn(["home", "office", "other"]);
const isDefault = check("isDefault", "Default address must be 0 or 1.").optional({ values: "falsy" }).isIn([0, 1, "0", "1", true, false, "true", "false"]);

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
            output = [countryId, stateId, name, status, slug];
            break;
        case "customer":
            output = [name, mobile, email, dateOfBirth, status];
            break;
        case "customer-address":
            output = [id, addressLine1, addressLine2, landmark, addressState, addressCity, pincode, latitude, longitude, locationType, isDefault];
            break;
        case "customer-address-update":
            output = [id, addressId, addressLine1, addressLine2, landmark, addressState, addressCity, pincode, latitude, longitude, locationType, isDefault];
            break;
        case "rating-tag":
            output = [tagFor, tagName, tagType, status];
            break;
        case "service-type":
            output = [categoryId, name, status];
            break;
        case "service-category":
            output = [name, status, slug, nameHiCategory, descriptionOptional, displayOrder];
            break;
        case "service-provider":
            output = [name, mobile, email, cityId, serviceCategoryId, panCardNumber, aadharNumber, experienceYears, experienceDescription, image, panCardDocument, aadharDocument];
            break;
        case "service-provider-status":
            output = [id, profileStatus, isVerified];
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
            output = [email, otp, new_password, confirm_password];
            break;
        case "admin-profile-password":
            output = [current_password, new_password.custom((value, { req }) => {
                if (value === req.body.current_password) throw new Error("New password must be different from your current password.");
                return true;
            }), confirm_password];
            break;
        case "faq":
            output = [question, answer, status, displayOrder];
            break;
        case "testimonial":
            output = [testimonialFrom, name, designation, rating, review, status];
            break;
        case "banner":
            output = [bannerType, bannerLink, displayOrder];
            break;
        case "enquiry-resolve":
            output = [id, isResolved];
            break;
        case "enquiry-submit":
            output = [name, email, phone, subject, message];
            break;
        case "cms-page":
            output = [pageSlug, pageTitle, pageTitleHi, metaDescription, metaKeywords, content, contentHi, viewCount];
            break;
        case "service-provider-register":
            output = [name, mobile, email, cityId, serviceCategoryId, panCardNumber, aadharNumber, experienceYears, experienceDescription, otp, image, panCardDocument, aadharDocument];
            break;
        case "our-value-create":
            output = [ourValueIconRequired, title, description, displayOrder, status];
            break;
        case "our-value-update":
            output = [title, description, displayOrder, status];
            break;
        case "our-milestone":
            output = [year, event, displayOrder, status];
            break;
        case "setting-update":
            output = [settingType];
            break;
        default:
            output = [];
    }

    return [...output, trapErrors];
};
