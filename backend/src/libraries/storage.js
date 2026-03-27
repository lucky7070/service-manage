import multer from "multer";
import fs from "fs";
import path from "path";
import { SUPPORTED_FORMATS_IMAGE, SUPPORTED_FORMATS_DOC } from '../config/files.js';

export const Storage = class {

    constructor({ dir = 'admins', isImage = false, isDoc = false, fileSize = 2 }) {

        const maxAllowSize = fileSize * Math.pow(1024, 2);

        const fileFilter = (req, file, cb) => {

            // Check uploaded file not exceed permitted size.
            const reqSize = parseInt(req.headers["content-length"]);

            if (reqSize && reqSize > maxAllowSize) {
                req.fileValidationError = { [file.fieldname]: 'Uploaded file is too large to upload..!!' };
                return cb(null, false, new Error('Uploaded file is too large to upload..!!'));
            }

            // Check uploaded file is image.
            if (isImage && !SUPPORTED_FORMATS_IMAGE.includes(file.mimetype)) {
                req.fileValidationError = { [file.fieldname]: 'Please select only Image Only..!!' };
                return cb(null, false, new Error('Please select only Image Only..!!'));
            }

            // Check uploaded file is Document.
            if (isDoc && !SUPPORTED_FORMATS_DOC.includes(file.mimetype)) {
                req.fileValidationError = { [file.fieldname]: 'Please select document file Only..!!' };
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
        return this.upload.single(fieldName);
    }

    array(fieldName = 'image', maxCount = 5) {
        return this.upload.array(fieldName, maxCount);
    }

    fields(fieldsArray) {
        return this.upload.fields(fieldsArray);
    }

    any() {
        return this.upload.any();
    }
};

export const deleteFile = (deleteFile) => {
    try {
        if (deleteFile === null || deleteFile == undefined) return true;

        deleteFile = deleteFile.replace(`${process.env.BASEURL}uploads/`, '');

        if (![
            'users/avatar.png',
            'admins/avatar.png',
            '404-file-not-found.jpg'
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