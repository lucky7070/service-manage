import { Setting } from "../../models/index.js";

const TYPE_REQUIRED_FIELDS = {
    1: ["application_name", "copyright", "address", "email", "phone"],
    2: ["facebook", "twitter", "linkdin", "instagram"],
    3: ["email_from", "smtp_host", "smtp_port", "smtp_user", "smtp_pass"],
    4: ["razorpay_key", "razorpay_secret", "merchant_id"],
    5: ["sms_key", "sms_url", "sms_hash", "sms_sender"],
    6: ["force_update_android", "force_update_ios", "app_version_android", "app_version_ios", "app_url_android", "app_url_ios", "force_update_message_android", "force_update_message_ios", "maintenance", "maintenance_toggle", "information_banner_toggle"]
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

