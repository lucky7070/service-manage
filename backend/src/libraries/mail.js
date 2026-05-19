import nodemailer from "nodemailer";
import moment from "moment";
import { config } from "../config/index.js";
import logger from "../helpers/logger.js";
import { escapeHtml, nowPlusMinutes, ObjectId } from "../helpers/utils.js";
import { getSettings } from "../helpers/database.js";
import { emailDetailRow, emailDetailsTable, emailGreeting, emailInfoBox, emailOtpBlock, emailParagraph, formatBookingStatus, renderEmailLayout } from "../helpers/emailTemplates.js";
import { Booking } from "../models/Booking.js";

export const sendSmtpMail = async ({ to, subject, html, subHeading, footerTagline }) => {
    try {

        const settings = await getSettings(["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "email_from", "application_name", "email"]);
        const safeAppName = escapeHtml(String(settings.application_name || "").trim());
        const supportEmail = escapeHtml(String(settings.email || "").trim());

        if (!settings.smtp_host || !settings.smtp_user) {
            return { sent: false, error: "SMTP is not configured." };
        }

        const transporter = nodemailer.createTransport({
            host: settings.smtp_host,
            port: settings.smtp_port,
            secure: settings.smtp_port === 465,
            auth: { user: settings.smtp_user, pass: settings.smtp_pass }
        });
        const subjectUpdated = `${subject} - ${safeAppName}`;
        await transporter.sendMail({
            from: settings.email_from, to, subject: subjectUpdated,
            html: renderEmailLayout({
                heading: subject,
                subHeading: String(subHeading || "").trim(),
                appName: safeAppName,
                bodyHtml: html,
                supportEmail,
                footerTagline
            })
        });

        return { sent: true };
    } catch (error) {
        return { sent: false, error: error?.message || String(error) };
    }
};

export async function passwordResetMail({ email, name, otp }) {
    try {
        const expiresIn = escapeHtml(String(config.otpExpiryMinutes));
        const expiresAtLabel = moment(nowPlusMinutes(config.otpExpiryMinutes)).format("DD MMM YYYY, hh:mm A");

        const html = `
        ${emailGreeting(name)}
        ${emailParagraph(`We received a request to reset the password for your account. Use the one-time verification code below to continue. This code is valid for <strong>${expiresIn} minutes</strong>.`)}
        ${emailOtpBlock({ code: otp, expiresAtLabel })}
        ${emailInfoBox({
            title: "Security alert",
            body: "If you did not request this password reset, please ignore this email. No changes will be made to your account. For additional safety, never share this OTP with anyone."
        })}`;

        const result = await sendSmtpMail({
            to: email,
            subject: "Password Reset Code",
            subHeading: "Verify your identity to create a new password",
            html,
            footerTagline: "Account protection"
        });

        if (!result.sent) {
            logger.warn(`Password reset email not sent for ${email}: ${result.error}`);
            return false;
        }

        return true;
    } catch (error) {
        logger.error(`Password reset email failed: ${error?.message || error}`);
        return false;
    }
}

export async function bookingStatusMail(bookingId) {
    try {
        const id = ObjectId(bookingId);
        if (!id) return { sent: false, reason: "invalid_id" };

        const [booking] = await Booking.aggregate([
            { $match: { _id: ObjectId(id), deletedAt: null } },
            { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
            { $lookup: { from: "serviceproviders", localField: "providerId", foreignField: "_id", as: "provider" } },
            { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
            { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceTypes" } },
            { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
            {
                $project: {
                    bookingNumber: 1,
                    status: 1,
                    issueDescription: 1,
                    bookingTime: 1,
                    quotedPrice: 1,
                    agreedPrice: 1,
                    finalPrice: 1,
                    scheduledTime: 1,
                    location: 1,
                    customerName: { $ifNull: [{ $first: "$customer.name" }, "Customer"] },
                    customerEmail: { $ifNull: [{ $first: "$customer.email" }, ""] },
                    providerName: { $ifNull: [{ $first: "$provider.name" }, ""] },
                    providerMobile: { $ifNull: [{ $first: "$provider.mobile" }, ""] },
                    serviceCategoryName: { $ifNull: [{ $first: "$category.name" }, ""] },
                    cityName: { $ifNull: [{ $first: "$city.name" }, ""] },
                    serviceTypes: {
                        $map: {
                            input: "$serviceTypes",
                            as: "serviceType",
                            in: { name: "$$serviceType.name", basePrice: "$$serviceType.basePrice" }
                        }
                    }
                }
            }
        ]);
        if (!booking) return { sent: false, reason: "booking_not_found" };
        if (!booking.customerEmail) return { sent: false, reason: "customer_email_not_found" };

        const customerName = booking.customerName || "Customer";
        const bookingNumber = escapeHtml(booking.bookingNumber || "—");
        const serviceNames = (booking.serviceTypes || []).map((row) => row?.name).filter(Boolean).map((name) => escapeHtml(name)).join(", ") || "—";

        const formatBookingDateTime = (value) => {
            if (!value) return "—";
            const m = moment(value);
            return m.isValid() ? m.format("DD MMM YYYY, hh:mm A") : "—";
        };

        const formatBookingAddress = (location) => {
            if (!location) return "—";
            const parts = [
                location.addressLine1,
                location.addressLine2,
                location.landmark,
                [location.city, location.state].filter(Boolean).join(", "),
                location.pincode
            ].filter((part) => String(part || "").trim());
            return parts.length ? parts.map((p) => escapeHtml(String(p).trim())).join(", ") : "—";
        };

        const formatBookingPrice = (booking) => {
            const pick = [booking.finalPrice, booking.agreedPrice, booking.quotedPrice].map((v) => Number(v)).find((n) => Number.isFinite(n) && n > 0);
            return pick != null ? `₹${pick.toLocaleString("en-IN")}` : "Pending quote";
        };

        const rows = [
            emailDetailRow("Booking ID", bookingNumber),
            emailDetailRow("Status", escapeHtml(formatBookingStatus(booking.status))),
            emailDetailRow("Service category", escapeHtml(booking.serviceCategoryName || "—")),
            emailDetailRow("Services", serviceNames),
            emailDetailRow("Service provider", escapeHtml(booking.providerName || "—")),
            emailDetailRow("Scheduled for", escapeHtml(formatBookingDateTime(booking.scheduledTime))),
            emailDetailRow("Booked on", escapeHtml(formatBookingDateTime(booking.bookingTime))),
            emailDetailRow("Service address", formatBookingAddress(booking.location)),
            emailDetailRow("City", escapeHtml(booking.cityName || booking.location?.city || "—")),
            emailDetailRow("Price", escapeHtml(formatBookingPrice(booking)))
        ].join("");

        const html = `
        ${emailGreeting(customerName)}
        ${emailParagraph("Thank you for booking with us. Here are your booking details:")}
        ${emailDetailsTable(rows)}
        ${booking.issueDescription ? emailParagraph(`<strong>Issue description:</strong><br />${escapeHtml(String(booking.issueDescription))}`) : ""}
        ${emailParagraph("You can track this booking anytime from your account dashboard.")}`;

        const result = await sendSmtpMail({
            to: booking.customerEmail,
            subject: `Booking confirmation – ${booking.bookingNumber || "New booking"}`,
            subHeading: "Your service booking has been registered successfully.",
            html,
            footerTagline: "Thank you for choosing us"
        });

        if (!result.sent) {
            logger.warn(`Password reset email not sent for ${email}: ${result.error}`);
            return false;
        }

        return true;
    } catch (error) {
        logger.error(`Booking status email failed: ${error?.message || error}`);
        return false;
    }
}
