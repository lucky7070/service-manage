import { config } from "./index.js";

export const SUPPORTED_FORMATS_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
export const SUPPORTED_FORMATS_DOC = ["application/pdf"];
export const SERVICE_PROVIDER_PROFILE_STATUSES = ["pending", "approved", "rejected", "suspended"];
export const BANNER_TYPES = ["homepage", "category"];

// Indian mobile: optional +91 / leading 0, then 10-digit starting with 6–9.
export const PHONE_REGEXP = /^(?:(?:\+|0{0,2})91(\s*|[-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/;
export const PERSON_NAME_REGEXP = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const PERSON_NAME_ERROR_MESSAGE = "Name can only contain letters (A-Z) and spaces.";

export const COOKIE_OPTIONS = {
    path: "/",
    httpOnly: true,
    domain: config.crossOrigin && config.cookieDomain ? config.cookieDomain : undefined,
    sameSite: config.crossOrigin ? "none" : "lax",
    secure: config.crossOrigin ? true : config.isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const JWT_CONFIG = {
    expiresIn: "7d",
    algorithm: "HS256"
};