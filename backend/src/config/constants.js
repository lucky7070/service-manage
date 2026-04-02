export const SUPPORTED_FORMATS_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
export const SUPPORTED_FORMATS_DOC = ["application/pdf"];
export const SERVICE_PROVIDER_PROFILE_STATUSES = ["pending", "approved", "rejected", "suspended"];
export const BANNER_TYPES = ["homepage", "category"];

// Indian mobile: optional +91 / leading 0, then 10-digit starting with 6–9.
export const PHONE_REGEXP = /^(?:(?:\+|0{0,2})91(\s*|[-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/;

export const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
};