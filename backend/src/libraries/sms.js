import axios from "axios";
import logger from "../helpers/logger.js";

const normalizeMobile = (value) => String(value ?? "").replace(/\+/g, "").trim();
const SMS_URL = "https://api.bulksmsadmin.com/BulkSMSapi/keyApiSendSMS/sendSMS";
const SENDER = "AYTech";
const HEADERS = { apikey: String(process.env.SMS_API_KEY) };

const sendOTP = async (mobile, otp) => {
    try {
        const numbers = Array.isArray(mobile) ? mobile : [mobile];
        const smsReciever = numbers.map((number) => normalizeMobile(number)).filter((number) => number.length === 10).map((number) => ({ reciever: number }));

        if (smsReciever.length === 0) return false;

        const { data } = await axios.post(SMS_URL, {
            sender: SENDER,
            peId: "1001627210000038797",
            teId: "1007164906004582442",
            message: String(`Hello User, Your Login/Registration Verification Code is ${otp}. Thanks Serva. AYT`).trim(),
            smsReciever
        }, { headers: HEADERS });

        return Boolean(data?.isSuccess);
    } catch (_error) {
        logger.error(`Send OTP failed: ${JSON.stringify(_error.response?.data)}`);
        return false;
    }
};

export { sendOTP };