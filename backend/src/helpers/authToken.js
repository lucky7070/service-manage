export const extractBearerToken = (req) => {
    const header = req.headers?.authorization || req.headers?.Authorization;
    if (!header || typeof header !== "string") return null;

    const match = header.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();
    return token || null;
};

export const extractCustomerToken = (req) => extractBearerToken(req) || req.cookies?.customer_token || null;
