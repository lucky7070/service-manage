import { Setting } from "../models/index.js";

/** Default application settings rows (upsert by `setting_name`). */
export const SETTINGS_SEED_ROWS = [
    [1, "favicon", "Favicon (25*25)", "file", "/application/favicon.png"],
    [1, "logo", "Logo", "file", "/application/logo.png"],
    [1, "application_name", "Application Name", "text", "Adiyogi Fintech"],
    [1, "copyright", "Copyright", "text", "Copyright © 2025. All rights reserved."],
    [1, "address", "Address", "text", "226,1st floor, Opp. Rajasthan Patrika Office, Manji Ka Hatha, Paota, Jodhpur, Rajasthan - 342001"],
    [1, "email", "Email", "text", "info@adiyogifintech.com"],
    [1, "phone", "Phone", "text", "9602570577"],
    [1, "brand_tagline", "Brand Tagline", "text", "Your trusted partner for all home services. Quality work, verified professionals, satisfaction guaranteed."],
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
    [6, "information_banner_toggle", "Information Banner Toggle", "check", "0"],
    [7, "refer_amount", "Refer amount on Register", "number", "0"],
    [7, "signup_rewards", "Signup Rewards", "number", "0"]
];

/**
 * Seed default settings (idempotent upserts).
 * @returns {Promise<{ rowsUpserted: number }>}
 */
export async function seedSettings() {
    const ops = SETTINGS_SEED_ROWS.map(([setting_type, setting_name, filed_label, filed_type, filed_value], idx) => {
        const settingTypeNum = Number(setting_type);
        if (!Number.isFinite(settingTypeNum)) {
            throw new Error(`Invalid seed row at index ${idx}: setting_type=${String(setting_type)} setting_name=${setting_name}`);
        }
        return {
            updateOne: {
                filter: { setting_name },
                update: { $set: { setting_type: settingTypeNum, setting_name, filed_label, filed_type, filed_value, status: 1 } },
                upsert: true
            }
        };
    });

    await Setting.bulkWrite(ops);
    return { rowsUpserted: SETTINGS_SEED_ROWS.length };
}
