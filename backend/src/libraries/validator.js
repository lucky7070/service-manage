import { check, param } from "express-validator";
import { BANNER_TYPES, PHONE_REGEXP, SERVICE_PROVIDER_PROFILE_STATUSES } from "../config/constants.js";
import { trapErrors } from "../middlewares/trapErrors.js";

const email = check("email", "Valid email is required.").exists().notEmpty().isEmail().withMessage('Invalid email.').isLength({ min: 2, max: 100 }).withMessage('Email must be between 2 to 100 characters long.').trim().normalizeEmail().toLowerCase();
const password = check("password", "Password must be greater then 5 digit.!!").exists().notEmpty().isLength({ min: 5, max: 50 }).withMessage('Password must be between 5 to 50 characters long.').trim();
const name = check("name", "Name is required.").exists().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 to 100 characters long.').trim();
const status = check("status", "Status is required.").exists().notEmpty().isIn([0, 1, "0", "1"]).withMessage('Status must be 0 or 1.');
const mobile = check("mobile", "Enter a valid Indian mobile number.").trim().notEmpty().matches(PHONE_REGEXP).withMessage("Enter a valid Indian mobile number.").isInt().customSanitizer(value => String(value)).isLength({ min: 10, max: 10 }).withMessage('mobile must be exactly 10 digits').trim();
const roleId = check("roleId", "Role ID is required.").exists().notEmpty().isMongoId().withMessage('Invalid role ID.');
const countryId = check("countryId", "Country ID is required.").exists().notEmpty().isMongoId().withMessage('Invalid country ID.');
const stateId = check("stateId", "State ID is required.").exists().notEmpty().isMongoId().withMessage('Invalid state ID.');
const settingType = param("type", "Setting type is invalid.").exists().notEmpty().isInt({ min: 1, max: 10 }).withMessage('Setting type must be between 1 to 10.');
const phone = check("phone", "Enter a valid Indian mobile number.").optional({ values: "falsy" }).trim().matches(PHONE_REGEXP).withMessage('Invalid mobile number.');
const subject = check("subject", "Subject must be 2–200 characters.").trim().notEmpty().isLength({ min: 2, max: 200 }).withMessage('Subject must be between 2 to 200 characters long.');
const slug = check("slug", "Slug: use lowercase letters, numbers, hyphens, and underscores only.").exists().notEmpty().matches(/^[a-z0-9_-]+$/).isLength({ min: 3, max: 60 }).withMessage("Slug must be 3 to 60 characters.").trim();
const message = check("message", "Message must be 10–5000 characters.").trim().notEmpty().isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 to 5000 characters long.');

const dateOfBirth = check("dateOfBirth", "Date of birth must be YYYY-MM-DD.").exists().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/);

const tagFor = check("tagFor", "Tag for is required.").exists().notEmpty().isIn(["customer", "provider"]).withMessage('Tag for must be customer or provider.');
const tagName = check("tagName", "Tag name is required.").exists().notEmpty().isLength({ min: 1, max: 100 }).withMessage('Tag name must be between 1 to 100 characters long.').trim();
const tagType = check("tagType", "Tag type is required.").exists().notEmpty().isIn(["positive", "negative", "neutral"]).withMessage('Tag type must be positive, negative or neutral.');

const categoryId = check("categoryId", "Category is required.").exists().notEmpty().isMongoId().withMessage('Invalid category ID.');
const nameHiCategory = check("nameHi").optional({ values: "falsy" }).isLength({ max: 200 }).withMessage('Name in Hindi must be between 0 to 200 characters long.');
const descriptionOptional = check("description").optional({ values: "falsy" }).isLength({ max: 5000 }).withMessage('Description must be between 0 to 5000 characters long.');

const panCardNumber = check("panCardNumber", "Valid PAN is required (e.g. ABCDE1234F).").trim().notEmpty().matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/).customSanitizer((v) => String(v).trim().toUpperCase());
const aadharNumber = check("aadharNumber", "Aadhar must be exactly 12 digits.").trim().notEmpty().matches(/^[0-9]{12}$/);
const experienceYears = check("experienceYears").optional().custom((value) => {
    if (value === undefined || value === null || value === "") return true;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 80;
});

const experienceDescription = check("experienceDescription").optional({ values: "falsy" }).isLength({ max: 5000 }).withMessage('Experience description must be between 0 to 5000 characters long.').trim();
const profileStatus = check("profileStatus", "Profile status is required.").exists().notEmpty().isIn(SERVICE_PROVIDER_PROFILE_STATUSES);
const rejectionReason = check("rejectionReason").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).custom((value, { req }) => {
    const status = String(req.body.profileStatus);
    if (status === "rejected" || status === "suspended") {
        const text = String(value || "").trim();
        if (text.length < 10) {
            throw new Error(`${status === "suspended" ? "Suspension" : "Rejection"} reason must be at least 10 characters.`);
        }
    }

    return true;
});
const isVerified = check("isVerified", "isVerified must be 0 or 1.").exists().notEmpty().isIn([0, 1, "0", "1", true, false, "true", "false"]).withMessage('isVerified must be 0 or 1.');
const isResolved = check("isResolved", "isResolved must be 0 or 1.").exists().notEmpty().isIn([0, 1, "0", "1", true, false, "true", "false"]).withMessage('isResolved must be 0 or 1.');
const id = param("id", "Invalid ID.").exists().notEmpty().isMongoId();
const passwordOptional = check("password", "Password must be greater then 5 digit.!!").optional({ values: "falsy", nullable: true }).isLength({ min: 5, max: 50 }).withMessage('Password must be between 5 to 50 characters long.');
const imageRequired = check("image", "Profile image is required.").custom((_, { req }) => {
    if (!req.file) throw new Error("Profile image is required.");
    return true;
});

const otp = check("otp", "Enter the 6-digit code.").trim().notEmpty().matches(/^[0-9]{6}$/).withMessage("OTP must be 6 digits.");
const current_password = check("current_password", "Current password must be 8–50 characters.").trim().notEmpty().isLength({ min: 8, max: 50 }).withMessage('Current password must be between 8 to 50 characters long.');
const new_password = check("new_password", "New password must be 8–50 characters.").trim().notEmpty().isLength({ min: 8, max: 50 }).withMessage('New password must be between 8 to 50 characters long.');
const confirm_password = check("confirm_password", "Please confirm your new password.").trim().notEmpty().custom((value, { req }) => {
    if (value !== req.body.new_password) throw new Error("New password and confirmation do not match.");
    return true;
})
const question = check("question", "Question is required.").trim().notEmpty().isLength({ min: 3, max: 2000 }).withMessage('Question must be between 3 to 2000 characters long.');
const answer = check("answer", "Answer is required.").trim().notEmpty().isLength({ min: 3, max: 10000 }).withMessage('Answer must be between 3 to 10000 characters long.');
const displayOrder = check("displayOrder", "Display order must be numeric.").optional({ values: "falsy" }).isInt({ min: 0, max: 999999 }).withMessage('Display order must be between 0 to 999999.');
const testimonialFrom = check("from", "Form must be customer or provider.").trim().notEmpty().isIn(["customer", "provider"]).withMessage('Form must be customer or provider.');
const designation = check("designation", "Designation is required.").trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Designation must be between 2 to 100 characters long.');
const rating = check("rating", "Rating must be between 1 and 5.").exists().notEmpty().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 to 5.');
const review = check("review", "Review is required.").trim().notEmpty().isLength({ min: 3, max: 5000 }).withMessage('Review must be between 3 to 5000 characters long.');
const bannerType = check("bannerType", "Banner type is required.").optional({ values: "falsy" }).isIn(BANNER_TYPES).withMessage('Banner type must be banner, slider or testimonial.');
const bannerLink = check("link", "Invalid link.").optional({ values: "falsy" }).isLength({ max: 500 }).withMessage('Banner link must be between 0 to 500 characters long.').trim();
const interval = check("interval", "Billing interval is required.").trim().notEmpty().isIn(["day", "month", "year"]).withMessage('Billing interval must be day, month or year.');
const intervalCount = check("intervalCount", "Interval count must be at least 1.").optional({ values: "falsy" }).isInt({ min: 1, max: 365 }).withMessage('Interval count must be between 1 to 365.');
const subscriptionFeatures = check("features", "At least one feature with name and description is required.").custom((value) => {
    let parsed = value;
    if (typeof value === "string") {
        try {
            parsed = JSON.parse(value);
        } catch {
            throw new Error("Features must be valid JSON.");
        }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("At least one feature is required.");

    const complete = parsed.filter((row) => String(row?.name ?? "").trim() && String(row?.description ?? "").trim());
    if (!complete.length) throw new Error("Each feature must include name and description.");

    return true;
});
const assignSubscriptionId = check("subscriptionId", "Subscription plan is required.").trim().notEmpty().isMongoId().withMessage('Invalid subscription plan ID.');
const razorpayOrderId = check("razorpay_order_id", "Razorpay order ID is required.").trim().notEmpty().withMessage('Razorpay order ID is required.');
const razorpaySubscriptionId = check("razorpay_subscription_id", "Razorpay subscription ID is required.").trim().notEmpty().withMessage("Razorpay subscription ID is required.");
const razorpayPaymentId = check("razorpay_payment_id", "Razorpay payment ID is required.").trim().notEmpty().withMessage('Razorpay payment ID is required.');
const razorpaySignature = check("razorpay_signature", "Razorpay signature is required.").trim().notEmpty().withMessage('Razorpay signature is required.');
const pageSlug = check("pageSlug", "Page slug is required.").trim().notEmpty().isLength({ min: 2, max: 150 }).withMessage('Page slug must be between 2 to 150 characters long.').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const pageTitle = check("pageTitle", "Page title is required.").trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Page title must be between 2 to 255 characters long.');
const pageTitleHi = check("pageTitleHi").optional({ values: "falsy" }).isLength({ max: 255 }).withMessage('Page title in Hindi must be between 0 to 255 characters long.').trim();
const metaDescription = check("metaDescription").optional({ values: "falsy" }).isLength({ max: 5000 }).withMessage('Meta description must be between 0 to 5000 characters long.').trim();
const metaKeywords = check("metaKeywords").optional({ values: "falsy" }).isLength({ max: 5000 }).withMessage('Meta keywords must be between 0 to 5000 characters long.').trim();
const content = check("content").optional({ values: "falsy" }).isLength({ max: 200000 }).withMessage('Content must be between 0 to 200000 characters long.').trim();
const contentHi = check("contentHi").optional({ values: "falsy" }).isLength({ max: 200000 }).withMessage('Content in Hindi must be between 0 to 200000 characters long.').trim();
const viewCount = check("viewCount", "View count must be 0 or greater.").optional({ values: "falsy" }).isInt({ min: 0 }).withMessage('View count must be 0 or greater.');
const cityId = check("cityId", "City ID is required.").trim().notEmpty().isMongoId().withMessage('Invalid city ID.');
const serviceCategoryId = check("serviceCategoryId", "Service category is required.").trim().notEmpty().isMongoId().withMessage('Invalid service category ID.');
const image = check("image", "Profile image is required.").custom((_, { req }) => {
    if (Object.keys(req.fileValidationError || {}).length) return true;
    if (!req.params?.id && !req.files?.image?.[0]?.filename) throw new Error("Profile image is required.");
    return true;
});

const panCardDocument = check("panCardDocument", "PAN card document is required.").custom((_, { req }) => {
    if (Object.keys(req.fileValidationError || {}).length) return true;
    if (!req.params?.id && !req.files?.panCardDocument?.[0]?.filename) throw new Error("PAN card document is required.");
    return true;
});

const aadharDocument = check("aadharDocument", "Aadhar document is required.").custom((_, { req }) => {
    if (Object.keys(req.fileValidationError || {}).length) return true;
    if (!req.params?.id && !req.files?.aadharDocument?.[0]?.filename) throw new Error("Aadhar document is required.");
    return true;
});
const ourValueIconRequired = check("icon", "Icon image is required.").custom((_, { req }) => {
    if (!req.file?.filename) throw new Error("Icon image is required.");
    return true;
});
const title = check("title", "Title is required.").trim().notEmpty().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 to 200 characters long.');
const description = check("description", "Description is required.").trim().notEmpty().isLength({ min: 3, max: 5000 }).withMessage('Description must be between 3 to 5000 characters long.');
const year = check("year", "Year is required.").trim().notEmpty().isLength({ min: 4, max: 4 }).withMessage('Year must be exactly 4 digits.');
const event = check("event", "Event is required.").trim().notEmpty().isLength({ min: 3, max: 5000 }).withMessage('Event must be between 3 to 5000 characters long.');
const fcmTokenOptional = check("fcmToken").optional({ values: "falsy" }).trim().isLength({ min: 10, max: 4096 }).withMessage('FCM token must be between 10 to 4096 characters long.');
const deviceIdOptional = check("deviceId").optional({ values: "falsy" }).trim().isLength({ min: 3, max: 200 }).withMessage('Device ID must be between 3 to 200 characters long.');
const referralCodeOptional = check("referralCode").optional({ values: "falsy" }).trim().isLength({ min: 2, max: 20 }).withMessage("Referral code must be between 2 to 20 characters long.");

const addressId = param("addressId", "Invalid address ID.").exists().notEmpty().isMongoId();
const addressLine1 = check("addressLine1", "Address line 1 is required.").trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Address line 1 must be between 2 to 100 characters long.');
const addressLine2 = check("addressLine2", "Address line 2 is required.").trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Address line 2 must be between 2 to 100 characters long.');
const landmark = check("landmark").optional({ values: "falsy" }).trim().isLength({ max: 200 }).withMessage('Landmark must be between 0 to 200 characters long.');
const addressState = check("state", "State is required.").trim().notEmpty().isMongoId().withMessage('Invalid state ID.');
const addressCity = check("city", "City is required.").trim().notEmpty().isMongoId().withMessage('Invalid city ID.');
const pincode = check("pincode", "Pincode must be 6 digits.").trim().notEmpty().matches(/^\d{6}$/).withMessage('Pincode must be exactly 6 digits.');
const latitude = check("latitude", "Latitude must be numeric.").optional({ values: "falsy" }).isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90.");
const longitude = check("longitude", "Longitude must be numeric.").optional({ values: "falsy" }).isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180.");
const latitudeRequired = check("latitude", "Latitude is required.").exists().withMessage("Latitude is required.").bail().notEmpty().withMessage("Latitude is required.").isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90.");
const longitudeRequired = check("longitude", "Longitude is required.").exists().withMessage("Longitude is required.").bail().notEmpty().withMessage("Longitude is required.").isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180.");
const locationType = check("locationType", "Invalid location type.").optional({ values: "falsy" }).isIn(["home", "office", "other"]).withMessage('Location type must be home, office or other.');
const isDefault = check("isDefault", "Default address must be 0 or 1.").optional({ values: "falsy" }).isIn([0, 1, "0", "1", true, false, "true", "false"]).withMessage('Default address must be 0 or 1.');
const preferredLanguage = check("preferredLanguage", "Preferred language must be en or hi.").optional({ values: "falsy" }).isIn(["en", "hi"]).withMessage('Preferred language must be en or hi.');
const paymentType = check("paymentType", "Payment type must be Credit or Debit.").exists().notEmpty().isIn([1, 2, "1", "2"]).withMessage('Payment type must be Credit (1) or Debit (2).');
const amount = check("amount", "Amount must be greater than 0.").exists().notEmpty().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0.');
const particulars = check("particulars").optional({ values: "falsy" }).trim().isLength({ max: 5000 }).withMessage('Particulars must be between 0 to 5000 characters long.');
const bookingId = param("bookingId", "Invalid booking ID.").exists().notEmpty().isMongoId().withMessage('Invalid booking ID.');
const providerServiceId = param("serviceId", "Invalid service ID.").exists().notEmpty().isMongoId().withMessage('Invalid service ID.');
const providerServiceTypeId = check("serviceTypeId", "Service type is required.").exists().notEmpty().isMongoId().withMessage('Invalid service type ID.');
const price = check("price", "Price is required.").exists().notEmpty().isFloat({ min: 0 }).withMessage('Price must be greater than 0.');
const providerId = check("providerId", "Provider is required.").exists().notEmpty().isMongoId().withMessage('Invalid provider ID.');
const serviceTypeIds = check("serviceTypeId", "At least one service type is required.").exists().isArray({ min: 1 }).withMessage('At least one service type is required.');
const serviceTypeIdItems = check("serviceTypeId.*", "Invalid service type.").isMongoId().withMessage('Invalid service type ID.');
const bookingAddressId = check("addressId", "Address is required.").exists().notEmpty().isMongoId().withMessage('Invalid address ID.');
const scheduledTime = check("scheduledTime", "Scheduled date and time is required.").exists().notEmpty().isISO8601().toDate();
const issueDescription = check("issueDescription").optional({ values: "falsy" }).trim().isLength({ max: 5000 }).withMessage('Issue description must be between 0 to 5000 characters long.');
const quotedPrice = check("quotedPrice", "Quoted price must be greater than 0.").exists().notEmpty().isFloat({ min: 0.01 }).withMessage('Quoted price must be greater than 0.');
const chatMessage = check("message").optional({ values: "falsy" }).trim().isLength({ max: 5000 }).withMessage('Message must be between 0 to 5000 characters long.').custom((value, { req }) => {
    const text = String(value || "").trim();
    const hasFile = Boolean(req.file?.filename);
    if (!text && !hasFile) throw new Error("Message or image is required.");
    return true;
}).withMessage('Message or image is required.');
const starRatingFeedback = check("starRating", "Star rating must be between 1 and 5.").exists().notEmpty().isInt({ min: 1, max: 5 }).withMessage('Star rating must be between 1 to 5.');
const feedbackReviewText = check("reviewText").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage('Review text must be between 0 to 2000 characters long.');
const quickTagsFeedback = check("quickTags").optional().custom((value) => {
    if (value == null) return true;
    if (!Array.isArray(value)) throw new Error("quickTags must be an array.");
    if (value.length > 10) throw new Error("At most 10 quick tags are allowed.");
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
            output = [countryId, stateId, name, status, slug];
            break;
        case "customer":
            output = [name, mobile, email, dateOfBirth, status];
            break;
        case "customer-profile-update":
            output = [name, email, dateOfBirth, preferredLanguage];
            break;
        case "customer-profile-image":
            output = [imageRequired];
            break;
        case "customer-address":
            output = [id, addressLine1, addressLine2, landmark, addressState, addressCity, pincode, latitude, longitude, locationType, isDefault];
            break;
        case "customer-address-update":
            output = [id, addressId, addressLine1, addressLine2, landmark, addressState, addressCity, pincode, latitude, longitude, locationType, isDefault];
            break;
        case "customer-self-address":
            output = [addressLine1, addressLine2, landmark, addressState, addressCity, pincode, latitudeRequired, longitudeRequired, locationType, isDefault];
            break;
        case "customer-self-address-update":
            output = [addressId, addressLine1, addressLine2, landmark, addressState, addressCity, pincode, latitudeRequired, longitudeRequired, locationType, isDefault];
            break;
        case "customer-ledger":
            output = [id, paymentType, amount, particulars];
            break;
        case "customer-booking-create":
            output = [providerId, serviceTypeIds, serviceTypeIdItems, bookingAddressId, scheduledTime, issueDescription];
            break;
        case "customer-service-lead-create":
            output = [cityId, serviceCategoryId, serviceTypeIds, serviceTypeIdItems, bookingAddressId, scheduledTime, issueDescription];
            break;
        case "admin-service-lead-assign":
            output = [id, providerId];
            break;
        case "admin-service-lead-id":
            output = [id];
            break;
        case "customer-booking-id":
            output = [bookingId];
            break;
        case "booking-quote":
            output = [bookingId, quotedPrice];
            break;
        case "booking-message":
            output = [bookingId, chatMessage];
            break;
        case "booking-completion-verify":
            output = [bookingId, otp];
            break;
        case "provider-booking-start":
            output = [bookingId, latitudeRequired, longitudeRequired];
            break;
        case "booking-feedback":
            output = [bookingId, starRatingFeedback, feedbackReviewText, quickTagsFeedback];
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
            output = [id, profileStatus, isVerified, rejectionReason];
            break;
        case "admin":
            output = [name, mobile, roleId, email, password, status];
            break;
        case "admin-update":
            output = [name, mobile, roleId, email, passwordOptional, status];
            break;
        case "franchise":
            output = [name, mobile, email, password, status];
            break;
        case "franchise-update":
            output = [name, mobile, email, passwordOptional, status];
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
            output = [bannerType, bannerLink, displayOrder, status];
            break;
        case "subscription":
            output = [name, description, price, interval, intervalCount, subscriptionFeatures, status];
            break;
        case "provider-subscription-assign":
        case "provider-subscription-purchase":
            output = [assignSubscriptionId];
            break;
        case "provider-subscription-payment":
            output = [razorpayOrderId, razorpayPaymentId, razorpaySignature];
            break;
        case "provider-autopay-subscription-purchase":
            output = [assignSubscriptionId];
            break;
        case "provider-autopay-subscription-payment":
            output = [razorpaySubscriptionId, razorpayPaymentId, razorpaySignature];
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
            output = [name, mobile, email, cityId, serviceCategoryId, panCardNumber, aadharNumber, experienceYears, experienceDescription, otp, image, panCardDocument, aadharDocument, referralCodeOptional, fcmTokenOptional, deviceIdOptional];
            break;
        case "service-provider-login":
            output = [mobile, otp, fcmTokenOptional, deviceIdOptional];
            break;
        case "provider-service-create":
            output = [providerServiceTypeId, price, status];
            break;
        case "provider-service-update":
            output = [providerServiceId, providerServiceTypeId, price, status];
            break;
        case "provider-service-delete":
            output = [providerServiceId];
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
