import multer from "multer";
import fs from "fs";
import path from "path";
import { SUPPORTED_FORMATS_IMAGE, SUPPORTED_FORMATS_DOC } from '../config/constants.js';
import { config } from "../config/index.js";
import language from "../languages/english.js";

const wrapMulter = (middleware, fallbackField = 'file') => (req, res, next) => {
    middleware(req, res, (err) => {
        if (!err) return next();

        if (err.code === 'LIMIT_FILE_SIZE') {
            const field = err.field || fallbackField;
            req.addFileValidationError(field, language.FILE_TOO_LARGE);
        }

        return next();
    });
};

export const Storage = class {

    constructor({ dir = 'admins', isImage = false, isDoc = false, fileSize = 2 }) {

        const maxAllowSize = fileSize * Math.pow(1024, 2);

        const fileFilter = (req, file, cb) => {

            const isValidImage = SUPPORTED_FORMATS_IMAGE.includes(file.mimetype);
            const isValidDoc = SUPPORTED_FORMATS_DOC.includes(file.mimetype);

            // Accept either image or document when both flags are enabled.
            if (isImage && isDoc && !isValidImage && !isValidDoc) {
                req.addFileValidationError(file.fieldname, 'Please select only image or document file..!!');
                return cb(null, false, new Error('Please select only image or document file..!!'));
            }

            // Accept only image when only image uploads are enabled.
            if (isImage && !isDoc && !isValidImage) {
                req.addFileValidationError(file.fieldname, 'Please select only Image Only..!!');
                return cb(null, false, new Error('Please select only Image Only..!!'));
            }

            // Accept only document when only doc uploads are enabled.
            if (!isImage && isDoc && !isValidDoc) {
                req.addFileValidationError(file.fieldname, 'Please select document file Only..!!');
                return cb(null, false, new Error('Please select document file Only..!!'));
            }

            cb(null, true);
        }

        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                let pathToSave = `public/uploads/${dir}`;
                fs.mkdirSync(pathToSave, { recursive: true })
                return cb(null, pathToSave)
            },
            filename: function (req, file, cb) {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
                cb(null, file.fieldname + '-' + uniqueSuffix)
            },
        });

        this.upload = multer({ storage, fileFilter, limits: { fileSize: maxAllowSize } });
    }

    single(fieldName = 'image') {
        return wrapMulter(this.upload.single(fieldName), fieldName);
    }

    array(fieldName = 'image', maxCount = 5) {
        return wrapMulter(this.upload.array(fieldName, maxCount), fieldName);
    }

    fields(fieldsArray) {
        return wrapMulter(this.upload.fields(fieldsArray), fieldsArray[0]?.name || 'file');
    }

    any() {
        return wrapMulter(this.upload.any(), 'file');
    }
};

export const deleteFile = (deleteFile) => {
    try {
        if (deleteFile === null || deleteFile == undefined) return true;

        deleteFile = deleteFile.replace(`${config.baseUrl}uploads/`, '');

        if (![
            '/customers/default.png',
            '/admins/default.png',
            '/service-provider/default.png',
            '/testimonials/default.png',
            '/img-not-found.jpg'
        ].includes(deleteFile)) {
            deleteFile = `public/uploads/` + deleteFile;
            if (fs.existsSync(deleteFile)) {
                fs.unlinkSync(deleteFile)
            }
        }

        return true;
    } catch (error) {
        return false;
    }
}

const toUploadRelativePath = (filePath) => {
    return filePath.replaceAll('\\', '/').replaceAll('public/uploads/', '');
}

export const cleanRequestFiles = (req) => {
    try {

        if (req.file?.path) {
            deleteFile(toUploadRelativePath(req.file.path));
        } else if (Array.isArray(req.files)) {
            req.files.forEach((file) => file?.path && deleteFile(toUploadRelativePath(file.path)));
        } else if (req.files && typeof req.files === "object") {
            Object.values(req.files).forEach((group) => {
                if (Array.isArray(group)) {
                    group.forEach((file) => file?.path && deleteFile(toUploadRelativePath(file.path)));
                }
            });
        }

        return true;
    } catch (error) {
        return false;
    }
}