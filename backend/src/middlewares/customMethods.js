import language from "../languages/english.js";

const toInt = (value, fallback) => {
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) ? fallback : num;
};

export const customMethods = (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");

    const { limit, pageNo, query, orderBy, orderDirection } = req.query;
    req.query.limit = toInt(limit, 10);
    req.query.pageNo = toInt(pageNo, 1);
    req.query.query = query || null;
    req.query.orderBy = orderBy || "createdAt";
    req.query.orderDirection = orderDirection || "desc";

    req.getBody = function getBody(array) {
        const output = {};
        const reqBody = this.body || {};
        Object.keys(reqBody).forEach((key) => {
            if (array.includes(key)) output[key] = reqBody[key];
        });
        return output;
    };

    res.noRecords = function noRecords(status = false, message = null) {
        return this.status(404).json({
            status,
            message: message || language.NO_RECORD_FOUND,
            data: []
        });
    };

    res.success = function success(data = [], message = null) {
        return this.status(200).json({
            status: true,
            message: message || language.SUCCESS,
            data
        });
    };

    res.datatableNoRecords = function datatableNoRecords() {
        return this.status(404).json({
            status: true,
            message: language.NO_RECORD_FOUND,
            data: {
                count: 0,
                current_page: 1,
                totalPages: 0,
                pagination: [],
                record: []
            }
        });
    };

    res.pagination = function pagination(results = [], totalCount = 0, limitArg = 10, pageNoArg = 1, range = 3) {
        const totalPages = Math.ceil(totalCount / limitArg) || 0;
        const paginationList = [pageNoArg];

        for (let i = 1; i <= range && pageNoArg + i <= totalPages; i += 1) paginationList.push(pageNoArg + i);
        for (let j = 1; j <= range && pageNoArg - j >= 1; j += 1) paginationList.unshift(pageNoArg - j);

        return this.success({
            count: totalCount,
            current_page: pageNoArg,
            totalPages,
            pagination: paginationList,
            record: results
        });
    };

    res.someThingWentWrong = function someThingWentWrong(error = { message: language.SOMETHING_WENT_WRONG }) {
        return this.status(403).json({
            status: false,
            message: error.message || language.SOMETHING_WENT_WRONG,
            data: process.env.SHOW_ERROR ? String(error.stack || "").split("\n").slice(0, 10) : []
        });
    };

    res.successInsert = function successInsert(data = [], message = null) {
        return this.status(201).json({
            status: true,
            message: message || language.RECORD_INSERTED_SUCCESSFULLY,
            data
        });
    };

    res.successUpdate = function successUpdate(data = [], message = null) {
        return this.status(200).json({
            status: true,
            message: message || language.RECORD_UPDATEDED_SUCCESSFULLY,
            data
        });
    };

    res.successDelete = function successDelete(data = [], message = null) {
        return this.status(200).json({
            status: true,
            message: message || language.RECORD_DELETED_SUCCESSFULLY,
            data
        });
    };

    res.setCookie = function setCookie(key, value) {
        this.cookie(key, value, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
    };

    next();
};
