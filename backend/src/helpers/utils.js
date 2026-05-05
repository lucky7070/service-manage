import moment from "moment";
import mongoose from "mongoose";

export const nowPlusMinutes = (minutes) => {
    return moment().add(minutes, "minutes").toDate();
};

export const generateOtp = (number_of_digits = 6) => String(Math.floor(10 ** (number_of_digits - 1) + Math.random() * 9 * 10 ** (number_of_digits - 1)));

export const generateBookingNumber = () => {
    const stamp = moment().valueOf().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `BK-${stamp}-${rand}`;
};

export const generateRandomString = (length) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

export const now = () => moment().toDate();

export const orderId = (seq, prefix, width = 6) => {
    const padded = String(seq).padStart(width, "0");
    return `${prefix}${padded}`;
};

export const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const ObjectId = (id) => {
    try {
        return new mongoose.Types.ObjectId(String(id));
    } catch {
        return null;
    }
};

export const toBoolean = (value) => value === true || value === "true" || Number(value) === 1;

export const optionalNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const escapeHtml = (value = "") => {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export const slugify = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);