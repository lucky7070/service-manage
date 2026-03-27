export const notFound = (req, res) => {
    if (typeof res.noRecords === "function") return res.noRecords(false, "Route not found");
    return res.status(404).json({ status: false, message: "Route not found", data: [] });
};

export const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (typeof res.someThingWentWrong === "function") return res.someThingWentWrong(err);
    return res.status(err.statusCode || 500).json({
        status: false,
        message: err.message || "Internal Server Error",
        data: []
    });
};
