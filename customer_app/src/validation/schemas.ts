import * as Yup from "yup";

const indianMobile = /^[6-9]\d{9}$/;

export const authDetailsSchema = (isLogin: boolean) =>
    Yup.object({
        mobile: Yup.string()
            .transform((value) => String(value || "").replace(/\D/g, "").slice(-10))
            .matches(indianMobile, "Enter a valid 10-digit Indian mobile number.")
            .required("Mobile number is required."),
        name: isLogin
            ? Yup.string().optional()
            : Yup.string().trim().min(2, "Full name is required.").required("Full name is required."),
        referralCode: Yup.string().trim().optional(),
    });

export const authOtpSchema = Yup.object({
    otp: Yup.string().trim().matches(/^\d{6}$/, "Enter the 6-digit code.").required("OTP is required."),
});

export const addressSchema = Yup.object({
    addressLine1: Yup.string().trim().min(2).max(100).required("Address line 1 is required."),
    addressLine2: Yup.string().trim().min(2).max(100).required("Address line 2 is required."),
    landmark: Yup.string().trim().max(200).optional(),
    state: Yup.string().required("State is required."),
    city: Yup.string().required("City is required."),
    pincode: Yup.string().trim().matches(/^\d{6}$/, "Pincode must be 6 digits.").required("Pincode is required."),
    latitude: Yup.number()
        .transform((_value, originalValue) => (originalValue === "" ? undefined : Number(originalValue)))
        .typeError("Latitude must be a valid number.")
        .required("Valid latitude is required.")
        .min(-90, "Latitude must be at least -90.")
        .max(90, "Latitude must be at most 90."),
    longitude: Yup.number()
        .transform((_value, originalValue) => (originalValue === "" ? undefined : Number(originalValue)))
        .typeError("Longitude must be a valid number.")
        .required("Valid longitude is required.")
        .min(-180, "Longitude must be at least -180.")
        .max(180, "Longitude must be at most 180."),
    locationType: Yup.string().oneOf(["home", "office", "other"]).required(),
    isDefault: Yup.boolean().required(),
});

export const profileSchema = Yup.object({
    name: Yup.string().trim().min(2, "Name must be at least 2 characters.").required("Name is required."),
    email: Yup.string().trim().email("Invalid email.").nullable().transform((v) => v || null),
    dateOfBirth: Yup.string().trim().nullable().transform((v) => v || null),
    preferredLanguage: Yup.string().oneOf(["en", "hi"]).required(),
});

export const bookingFeedbackSchema = Yup.object({
    starRating: Yup.number().min(1, "Please select a star rating from 1 to 5.").max(5).required(),
    reviewText: Yup.string().trim().max(2000).optional(),
    quickTags: Yup.array().of(Yup.string()).default([]),
});
