import * as Yup from "yup";
import { parseDate } from "../helpers/date";

const indianMobile = /^[6-9]\d{9}$/;
const personNamePattern = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const personNameField = (requiredMessage: string, minMessage: string) => Yup.string().trim().matches(personNamePattern, "Name can only contain letters (A-Z) and spaces.").min(2, minMessage).max(100, "Name must be at most 100 characters.").required(requiredMessage);

export const authDetailsSchema = (isLogin: boolean) =>
    Yup.object({
        mobile: Yup.string()
            .transform((value) => String(value || "").replace(/\D/g, "").slice(-10))
            .matches(indianMobile, "Enter a valid 10-digit Indian mobile number.")
            .required("Mobile number is required."),
        name: isLogin
            ? Yup.string().optional()
            : personNameField("Full name is required.", "Full name must be at least 2 characters."),
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
        .typeError("Capture your current location to continue.")
        .required("Capture your current location to continue.")
        .min(-90, "Location capture failed — try again outdoors with GPS enabled.")
        .max(90, "Location capture failed — try again outdoors with GPS enabled."),
    longitude: Yup.number()
        .transform((_value, originalValue) => (originalValue === "" ? undefined : Number(originalValue)))
        .typeError("Capture your current location to continue.")
        .required("Capture your current location to continue.")
        .min(-180, "Location capture failed — try again outdoors with GPS enabled.")
        .max(180, "Location capture failed — try again outdoors with GPS enabled."),
    locationType: Yup.string().oneOf(["home", "office", "other"]).required(),
    isDefault: Yup.boolean().required(),
});

export const profileSchema = Yup.object({
    name: personNameField("Name is required.", "Name must be at least 2 characters."),
    email: Yup.string().trim().email("Invalid email.").nullable().transform((v) => v || null),
    dateOfBirth: Yup.string().nullable().transform((v) => v || null).test("valid-date", "Enter a valid date.", (value) => !value || parseDate(value)?.isValid() === true),
    preferredLanguage: Yup.string().oneOf(["en", "hi"]).required(),
});

export const bookingFeedbackSchema = Yup.object({
    starRating: Yup.number().min(1, "Please select a star rating from 1 to 5.").max(5).required(),
    reviewText: Yup.string().trim().max(2000).optional(),
    quickTags: Yup.array().of(Yup.string()).default([]),
});

export const contactEnquirySchema = Yup.object({
    name: Yup.string().trim().min(2, "Name must be at least 2 characters.").max(100).required("Name is required."),
    email: Yup.string().trim().email("Enter a valid email address.").max(100).required("Email is required."),
    phone: Yup.string().trim().test("phone", "Enter a valid 10-digit mobile number.", (value) => !value || indianMobile.test(value)).required("Mobile number is required."),
    subject: Yup.string().trim().min(2, "Subject must be at least 2 characters.").max(200).required("Subject is required."),
    message: Yup.string().trim().min(10, "Please enter at least 10 characters.").max(5000).required("Message is required."),
});
