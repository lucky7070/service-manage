export const pickPushFields = (body = {}) => {
    const fields = {};
    const fcmToken = body.fcmToken ? String(body.fcmToken).trim() : null;
    const deviceId = body.deviceId ? String(body.deviceId).trim() : null;
    if (fcmToken) fields.fcmToken = fcmToken;
    if (deviceId) fields.deviceId = deviceId;
    return fields;
};
