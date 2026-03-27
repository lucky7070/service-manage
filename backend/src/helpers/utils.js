import moment from "moment";

export const nowPlusMinutes = (minutes) => {
    return moment().add(minutes, "minutes").toDate();
};

export const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const generateBookingNumber = () => {
    const stamp = moment().valueOf().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `BK-${stamp}-${rand}`;
};

export const now = () => moment().toDate();

export const orderId = (seq, prefix, width = 6) => {
    const padded = String(seq).padStart(width, "0");
    return `${prefix}${padded}`;
};

export const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");