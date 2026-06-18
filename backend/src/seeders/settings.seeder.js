import { Setting } from "../models/index.js";

/** Default application settings rows (upsert by `setting_name`). */
export const SETTINGS_SEED_ROWS = [
    [1, "favicon", "Favicon (25*25)", "file", "/application/favicon.png"],
    [1, "logo", "Logo", "file", "/application/logo.png"],
    [1, "application_name", "Application Name", "text", "Serva Services"],
    [1, "copyright", "Copyright", "text", "Copyright © 2026 Serva Services. All rights reserved."],
    [1, "address", "Address", "text", "226, 1st floor, Opp. Rajasthan Patrika Office, Manji Ka Hatha, Paota, Jodhpur, Rajasthan - 342001"],
    [1, "email", "Email", "text", "info@serva.technolite.in"],
    [1, "phone", "Phone", "text", "9602570577"],
    [1, "brand_tagline", "Brand Tagline", "text", "Your trusted partner for all home services. Verified professionals, quality work, satisfaction guaranteed."],
    [2, "facebook", "Facebook", "text", "https://www.facebook.com/"],
    [2, "twitter", "Twitter", "text", "https://x.com/"],
    [2, "linkdin", "Linkdin", "text", "https://www.linkedin.com/"],
    [2, "instagram", "Instagram", "text", "https://www.instagram.com/"],
    [3, "email_from", "Email From", "text", "noreply@serva.technolite.in"],
    [3, "smtp_host", "SMTP Host", "text", "smtp.sendgrid.net"],
    [3, "smtp_port", "SMTP Port", "text", "465"],
    [3, "smtp_user", "SMTP User", "text", "apikey"],
    [3, "smtp_pass", "SMTP Password", "text", "change_me_smtp_password"],
    [4, "razorpay_key", "Razor Key", "text", "change_me_razorpay_key"],
    [4, "razorpay_secret", "Razor Secret", "text", "change_me_razorpay_secret"],
    [4, "merchant_id", "Razor Merchant Id", "text", "change_me_razorpay_merchant_id"],
    [5, "sms_key", "SMS API Key", "text", "change_me_sms_api_key"],
    [5, "sms_url", "SMS API URL", "text", "https://api.bulksmsadmin.com/BulkSMSapi/keyApiSendSMS/sendSMS"],
    [5, "sms_hash", "SMS Hash", "text", "change_me_sms_hash"],
    [5, "sms_sender", "SMS Sender Id", "text", "AYTech"],
    [6, "force_update_android", "Force Update Android", "check", "0"],
    [6, "force_update_ios", "Force Update IOS", "check", "0"],
    [6, "app_version_android", "App Version Android App", "text", "1.0.0"],
    [6, "app_version_ios", "App Version IOS App", "text", "1.0.0"],
    [6, "app_url_android", "App URL Android App", "text", "https://play.google.com/store/apps/details?id=com.serva.services"],
    [6, "app_url_ios", "App URL IOS App", "text", "https://apps.apple.com/app/serva-services/id0000000000"],
    [6, "force_update_message_android", "Force Update Message Android", "textarea", "A new version of Serva Services is available. Please update the app to continue."],
    [6, "force_update_message_ios", "Force Update Message IOS", "textarea", "A new version of Serva Services is available. Please update the app to continue."],
    [6, "maintenance", "Maintenance", "textarea", "Serva Services is temporarily under maintenance. Please try again shortly."],
    [6, "maintenance_toggle", "Maintenance Toggle", "check", "0"],
    [6, "information_banner", "Information Banner", "file", ""],
    [6, "information_banner_toggle", "Information Banner Toggle", "check", "0"],
    [7, "force_update_android_pro", "Force Update Android", "check", "0"],
    [7, "force_update_ios_pro", "Force Update IOS", "check", "0"],
    [7, "app_version_android_pro", "App Version Android App", "text", "1.0.0"],
    [7, "app_version_ios_pro", "App Version IOS App", "text", "1.0.0"],
    [7, "app_url_android_pro", "App URL Android App", "text", "https://play.google.com/store/apps/details?id=com.serva.pro"],
    [7, "app_url_ios_pro", "App URL IOS App", "text", "https://apps.apple.com/app/serva-pro/id0000000000"],
    [7, "force_update_message_android_pro", "Force Update Message Android", "textarea", "A new version of the Serva Pro app is available. Please update to continue."],
    [7, "force_update_message_ios_pro", "Force Update Message IOS", "textarea", "A new version of the Serva Pro app is available. Please update to continue."],
    [7, "maintenance_pro", "Maintenance", "textarea", "Serva Pro is temporarily under maintenance. Please try again shortly."],
    [7, "maintenance_toggle_pro", "Maintenance Toggle", "check", "0"],
    [7, "information_banner_pro", "Information Banner", "file", ""],
    [7, "information_banner_toggle_pro", "Information Banner Toggle", "check", "0"],
    [8, "refer_amount", "Refer amount on Register", "number", "0"],
    [8, "signup_rewards", "Signup Rewards", "number", "0"],
    [8, "job_start_geofence_meters", "Job start geofence (meters)", "number", "50"]
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
