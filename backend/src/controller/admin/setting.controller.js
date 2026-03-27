import { Setting } from "../../models/index.js";

const TYPE_REQUIRED_FIELDS = {
    1: ["application_name", "copyright", "address", "email", "phone"],
    2: ["facebook", "twitter", "linkdin", "instagram"],
    3: ["email_from", "smtp_host", "smtp_port", "smtp_user", "smtp_pass"],
    4: ["razorpay_key", "razorpay_secret", "merchant_id"],
    5: ["sms_key", "sms_url", "sms_hash", "sms_sender"],
    6: ["force_update_android", "force_update_ios", "app_version_android", "app_version_ios", "app_url_android", "app_url_ios", "force_update_message_android", "force_update_message_ios", "maintenance", "maintenance_toggle", "information_banner_toggle"]
};

export const seedSettings = async (req, res) => {
    try {

        const SETTING_SEED = [
            [1, "favicon", "Favicon (25*25)", "file", "application/favicon_194008.png"],
            [1, "logo", "Logo", "file", "application/logo_295352.png"],
            [1, "application_name", "Application Name", "text", "Adiyogi Fintech"],
            [1, "copyright", "Copyright", "text", "Copyright © 2025. All rights reserved."],
            [1, "address", "Address", "text", "226,1st floor, Opp. Rajasthan Patrika Office, Manji Ka Hatha, Paota, Jodhpur, Rajasthan - 342001"],
            [1, "email", "Email", "text", "info@adiyogifintech.com"],
            [1, "phone", "Phone", "text", "9602570577"],
            [2, "facebook", "Facebook", "text", "https://www.facebook.com"],
            [2, "twitter", "Twitter", "text", "https://www.twitter.com"],
            [2, "linkdin", "Linkdin", "text", "https://www.linkdin.com"],
            [2, "instagram", "Instagram", "text", "https://www.instagram.com"],
            [3, "email_from", "Email From", "text", "info@adiyogifintech.com"],
            [3, "smtp_host", "SMTP Host", "text", "smtp.sendgrid.net"],
            [3, "smtp_port", "SMTP Port", "text", "465"],
            [3, "smtp_user", "SMTP User", "text", "apikey"],
            [3, "smtp_pass", "SMTP Password", "text", "change_me_smtp_password"],
            [4, "razorpay_key", "Razor Key", "text", "change_me_razorpay_key"],
            [4, "razorpay_secret", "Razor Secret", "text", "change_me_razorpay_secret"],
            [4, "merchant_id", "Razor Merchant Id", "text", "Nothing"],
            [5, "sms_key", "TextLocal Key", "text", "change_me_sms_key"],
            [5, "sms_url", "TextLocal URL", "text", "https://api.textlocal.in/send/"],
            [5, "sms_hash", "TextLocal Hash", "text", "change_me_sms_hash"],
            [5, "sms_sender", "TextLocal Sender Id", "text", "AYTSMS"],
            [6, "force_update_android", "Force Update Android", "check", "1"],
            [6, "force_update_ios", "Force Update IOS", "check", "1"],
            [6, "app_version_android", "App Version Android App", "number", "17.0"],
            [6, "app_version_ios", "App Version IOS App", "number", "1.0"],
            [6, "app_url_android", "App URL Android App", "text", "com.adiyogi.fintech"],
            [6, "app_url_ios", "App URL IOS App", "text", "https://www.apple.com/in/app-store"],
            [6, "force_update_message_android", "Force Update Message Android", "textarea", "Force Update Message.."],
            [6, "force_update_message_ios", "Force Update Message IOS", "textarea", "Force Update Message.."],
            [6, "maintenance", "Maintenance", "textarea", "Under Maintenance"],
            [6, "maintenance_toggle", "Maintenance Toggle", "check", "0"],
            [6, "information_banner", "Information Banner", "file", ""],
            [6, "information_banner_toggle", "Information Banner Toggle", "check", "0"]
        ];

        const ops = SETTING_SEED.map(([setting_type, setting_name, filed_label, filed_type, filed_value], idx) => {
            const settingTypeNum = Number(setting_type);
            if (!Number.isFinite(settingTypeNum)) {
                throw new Error(`Invalid seed row at index ${idx}: setting_type=${String(setting_type)} setting_name=${setting_name}`);
            }

            return ({
                updateOne: {
                    filter: { setting_name },
                    update: { $set: { setting_type: settingTypeNum, setting_name, filed_label, filed_type, filed_value, status: 1 } },
                    upsert: true
                }
            });
        });

        await Setting.bulkWrite(ops);
        return res.success(ops, "Settings seeded successfully");
    } catch (error) {
        console.log(error);
        return res.someThingWentWrong(error);
    }
};

export const getGeneralSettings = async (req, res) => {
    try {

        const rows = await Setting.find({ setting_type: [1, 2], status: 1 }, '-_id setting_name filed_value');
        return res.success(rows.reduce((acc, row) => ({ ...acc, [row.setting_name]: row.filed_value }), {}));
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSettings = async (req, res) => {
    try {
        const filter = { status: 1 };
        if (Object.keys(TYPE_REQUIRED_FIELDS).includes(req.params.type)) filter.setting_type = Number(req.params.type);

        const rows = await Setting.aggregate([
            { $match: filter },
            { $project: { _id: 1, setting_type: 1, setting_name: 1, filed_label: 1, filed_type: 1, filed_value: 1, createdAt: 1 } },
            { $sort: { setting_type: 1, createdAt: 1 } },
            { $group: { _id: "$setting_type", settings: { $push: "$$ROOT" } } },
        ]);

        if (!rows.length) return res.noRecords();

        return res.success(rows.reduce((acc, row) => ({ ...acc, [row._id]: row.settings }), {}));
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateSettingsByType = async (req, res) => {
    try {

        const settingType = Number(req.params.type);
        if (!Object.keys(TYPE_REQUIRED_FIELDS).includes(String(settingType))) throw new Error("Invalid setting type.");

        const requiredFields = TYPE_REQUIRED_FIELDS[settingType];
        const missing = requiredFields.filter((key) => req.body[key] === undefined || req.body[key] === null || String(req.body[key]).trim() === "");
        if (missing.length) {
            return res.status(422).json({
                status: false,
                message: MISSING_REQUIRED_FIELDS,
                data: missing.reduce((acc, key) => ({ ...acc, [key]: "This field is required." }), {})
            });
        }

        const rows = await Setting.find({ setting_type: settingType, status: 1 });
        if (!rows.length) return res.noRecords();

        const body = req.body || {};
        const filesMap = {};
        const files = Array.isArray(req.files) ? req.files : [];
        files.forEach((file) => {
            filesMap[file.fieldname] = `/application/${file.filename}`;
        });

        const ops = rows.map((row) => {
            let nextValue = row.filed_value;
            if (row.filed_type === "file" && filesMap[row.setting_name]) {
                nextValue = filesMap[row.setting_name];
            } else if (body[row.setting_name] !== undefined) {
                nextValue = String(body[row.setting_name]);
            }

            return {
                updateOne: {
                    filter: { _id: row._id },
                    update: { $set: { filed_value: nextValue } }
                }
            };
        });

        await Setting.bulkWrite(ops);

        return res.success();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

