import { AlLOWED_SIZE_MB, DOCUMENT_MIME_TYPES, IMAGE_MIME_TYPES } from "@/config";
import * as Yup from "yup";

export const checkDocSize = (value: unknown) => {
    if (value === null || value === undefined || value === "") return true;
    if (!(value instanceof File)) return true;
    return value.size <= AlLOWED_SIZE_MB * 1024 * 1024;
};

export const checkDocType = function (value: unknown, { parent }: Yup.TestContext<Yup.AnyObject>) {
    if (parent._id === undefined) return true;

    if (value === null || value === undefined || value === "") return false;
    if (!(value instanceof File)) return typeof value === "string";
    return DOCUMENT_MIME_TYPES.includes(value.type as typeof DOCUMENT_MIME_TYPES[number]);
};

export const checkImageType = (value: unknown, { parent }: Yup.TestContext<Yup.AnyObject>) => {
    if (parent._id === undefined) return true;

    if (value === null || value === undefined) return false;
    if (!(value instanceof File)) return typeof value === "string";
    return IMAGE_MIME_TYPES.includes(value.type as typeof IMAGE_MIME_TYPES[number]);
};