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
export const startOfDay = () => moment().startOf("day").toDate();

export const orderId = (seq, prefix, width = 6) => {
    const padded = String(seq).padStart(width, "0");
    return `${prefix}${padded}`;
};

export const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const ObjectId = (id) => {
    try {

        if (id instanceof mongoose.Types.ObjectId) return id;
        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        return new mongoose.Types.ObjectId(String(id));
    } catch {
        return null;
    }
};

export const toBoolean = (value) => value === true || String(value).toLowerCase() === "true" || Number(value) === 1 || String(value).toLowerCase() === "on";

export const optionalNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/** Haversine distance between two WGS84 points (degrees). @returns {number} meters */
export const distanceMeters = (lat1, lon1, lat2, lon2) => {
    const a1 = Number(lat1);
    const o1 = Number(lon1);
    const a2 = Number(lat2);
    const o2 = Number(lon2);
    if (![a1, o1, a2, o2].every((n) => Number.isFinite(n))) return Number.POSITIVE_INFINITY;

    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const φ1 = toRad(a1);
    const φ2 = toRad(a2);
    const Δφ = toRad(a2 - a1);
    const Δλ = toRad(o2 - o1);
    const sΔφ = Math.sin(Δφ / 2);
    const sΔλ = Math.sin(Δλ / 2);
    const h = sΔφ * sΔφ + Math.cos(φ1) * Math.cos(φ2) * sΔλ * sΔλ;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
};

export const escapeHtml = (value = "") => {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export const slugify = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);