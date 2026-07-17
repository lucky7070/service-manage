import { escapeHtml } from "./utils.js";

export const emailGreeting = (name) => `
    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #0f172a">
        Hello ${escapeHtml(name || "there")},
    </p>`;

export const emailParagraph = (text) => `
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #334155">
        ${text}
    </p>`;

export const emailDetailRow = (label, valueHtml) => `
    <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #64748b; width: 38%; vertical-align: top;">${escapeHtml(label)}</td>
        <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 500; vertical-align: top;">${valueHtml}</td>
    </tr>`;

export const emailDetailsTable = (rowsHtml) => `
    <div style="background: #f8fafc; border-radius: 16px; padding: 4px 20px; border: 1px solid #e2e8f0; margin: 12px 0 20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
            ${rowsHtml}
        </table>
    </div>`;

export const emailInfoBox = ({ title, body, borderColor = "#f59e0b", background = "#fef9e3", titleColor = "#92400e", bodyColor = "#78350f" }) => `
    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="background: ${background}; border-left: 4px solid ${borderColor}; border-radius: 16px; margin: 12px 0 20px 0;"
    >
        <tr>
            <td style="padding: 16px 20px">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${titleColor};">
                    ${escapeHtml(title)}
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.4; color: ${bodyColor};">
                    ${body}
                </p>
            </td>
        </tr>
    </table>`;

export const emailOtpBlock = ({ code, expiresAtLabel }) => `
    <div
        style="
            background: #f8fafc;
            border-radius: 24px;
            padding: 16px 20px;
            margin: 24px 0 20px 0;
            border: 1px solid #e2e8f0;
            text-align: center;
        "
    >
        <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; color: #475569;">
            Verification code
        </p>
        <div
            style="
                font-size: 44px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #1e293b;
                font-family: &quot;Courier New&quot;, monospace;
                background: #ffffff;
                display: inline-block;
                padding: 12px 24px;
                border-radius: 18px;
                border: 1px solid #e0e7ff;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
            "
        >
            ${escapeHtml(code || "")}
        </div>
        <p style="margin: 16px 0 0 0; font-size: 13px; color: #4b5563">
            Code expires at <strong>${escapeHtml(expiresAtLabel)}</strong>
        </p>
    </div>`;

export const renderEmailLayout = ({
    heading,
    bodyHtml,
    appName = "",
    subHeading = "",
    supportEmail = "",
    footerTagline = ""
}) => {
    const safeSubHeading = String(subHeading || "").trim();
    const safeSupportEmail = String(supportEmail || "").trim();
    const safeFooterTagline = String(footerTagline || "").trim();
    const displayAppName = appName || "Service Manage";

    const headerSubHeading = safeSubHeading ? `<p style=" margin: 10px 0 0 0; font-size: 15px; line-height: 1.4; color: #cbd5e1; " >${escapeHtml(safeSubHeading)}</p>` : "";
    const supportBlock = safeSupportEmail ? `<p style="margin: 8px 0 8px 0; font-size: 14px; color: #475569; text-align: center"> Need assistance? Contact our <a href="mailto:${escapeHtml(safeSupportEmail)}" style="color: #4f46e5; text-decoration: none; font-weight: 500" >support team</a > anytime. </p>` : "";
    const footerBelowCard = safeFooterTagline ? `<p style="margin: 24px 0 0 0; text-align: center; font-size: 12px; color: #6c86a3"> ${escapeHtml(safeFooterTagline)} | ${displayAppName} </p>` : "";

    return `<!doctype html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="x-apple-disable-message-reformatting" /><title>${escapeHtml(heading)}</title><!--[if gte mso 9 ]><xml ><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml ><! [endif]--><style> body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; } table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; } img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; } body { margin: 0; padding: 0; background-color: #eef2ff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } @media only screen and (max-width: 600px) { .responsive-container { width: 100% !important; } .inner-padding { padding: 28px 24px !important; } .otp-code-display { font-size: 32px !important; letter-spacing: 6px !important; padding: 12px 20px !important; } .button-reset { width: 100% !important; display: block !important; text-align: center !important; } } @media only screen and (prefers-color-scheme: dark) { .dark-mode-bg { background: #1e293b !important; } } </style></head><body style=" margin: 0; padding: 0; background: #eef2ff; font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif; " ><table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#eef2ff" style="background: #eef2ff" ><tr><td align="center" style="padding: 40px 20px"><table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style=" max-width: 580px; width: 100%; background: #ffffff; border-radius: 28px; box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.1); overflow: hidden; " ><tr><td bgcolor="#0f172a" style=" background: linear-gradient(135deg, #0f172a 0%, #3b2f9f 100%); padding: 32px 32px 28px 32px; " ><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align: center"><div style=" display: inline-block; background: rgba(255, 255, 255, 0.15); border-radius: 60px; padding: 8px 20px; margin-bottom: 14px; " ><span style=" font-size: 14px; font-weight: 600; letter-spacing: 1px; color: #ffffff; text-transform: uppercase; " >${displayAppName}</span ></div><h1 style=" margin: 10px 0 0 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; " > ${escapeHtml(heading)} </h1>${headerSubHeading}</td></tr></table></td></tr> <tr><td style="padding: 36px 32px 20px 32px; background: #ffffff">${bodyHtml}</td></tr> <tr><td style="padding: 8px 32px 8px 32px; background: #ffffff; border-top: 1px solid #edf2f7"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="text-align: center"><p style="margin: 0 0 10px 0; font-size: 12px; color: #6c757d"> &copy; ${new Date().getFullYear()} ${displayAppName} — All rights reserved. </p><p style="margin: 0; font-size: 12px; color: #94a3b8"> This message was sent to the registered email address associated with your account. </p></td></tr></table></td></tr><tr style="background: #ffffff"><td style="padding: 0 32px 32px 32px; text-align: center"><p style="margin: 0; font-size: 11px; color: #a0abb8"> This is an automated transactional email – please do not reply directly. </p>${supportBlock}</td></tr></table>${footerBelowCard}</td></tr></table></body></html>`;
};

export const formatBookingStatus = (status) => {
    const BOOKING_STATUS_LABELS = {
        price_pending: "Awaiting quote",
        confirmed: "Confirmed",
        in_progress: "In progress",
        completed: "Completed",
        cancelled: "Cancelled"
    };

    return BOOKING_STATUS_LABELS[String(status)] || String(status || "").replace(/_/g, " ");
}