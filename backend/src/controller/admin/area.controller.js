import moment from "moment";
import { Area, City, Country, State } from "../../models/index.js";
import { escapeRegex, ObjectId } from "../../helpers/utils.js";

export const createArea = async (req, res) => {
    try {
        const { countryId, stateId, cityId, name, status = 1 } = req.body;
        if (!countryId) return res.clientError("Country is required.", 422, [{ field: "countryId", message: "Required." }]);
        if (!stateId) return res.clientError("State is required.", 422, [{ field: "stateId", message: "Required." }]);
        if (!cityId) return res.clientError("City is required.", 422, [{ field: "cityId", message: "Required." }]);
        if (!name) return res.clientError("Area name is required.", 422, [{ field: "name", message: "Required." }]);

        const country = await Country.findOne({ _id: ObjectId(countryId), deletedAt: null });
        if (!country) return res.noRecords({ message: "Country not found." });

        const state = await State.findOne({ _id: ObjectId(stateId), countryId: country._id, deletedAt: null });
        if (!state) return res.noRecords({ message: "State not found for selected country." });

        const city = await City.findOne({ _id: ObjectId(cityId), countryId: country._id, stateId: state._id, deletedAt: null });
        if (!city) return res.noRecords({ message: "City not found for selected state." });

        const exists = await Area.findOne({
            countryId: country._id,
            stateId: state._id,
            cityId: city._id,
            name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
            deletedAt: null
        });
        if (exists) return res.clientError(`Area with name \"${name}\" already exists for selected city.`, 409, [{ field: "name", message: "Area name already in use." }]);

        const area = await Area.create({ countryId: country._id, stateId: state._id, cityId: city._id, name, isActive: Number(status) === 1 });
        return res.successInsert(area);
    } catch (error) {
        if (error.code === 11000) {
            return res.clientError("That area name is already in use for the selected city.", 409, [{ field: "name", message: "Area name already in use." }]);
        }
        return res.someThingWentWrong(error);
    }
};

export const updateArea = async (req, res) => {
    try {
        const area = await Area.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!area) return res.noRecords();

        const { countryId, stateId, cityId, name, status = 1 } = req.body;
        if (!countryId) return res.clientError("Country is required.", 422, [{ field: "countryId", message: "Required." }]);
        if (!stateId) return res.clientError("State is required.", 422, [{ field: "stateId", message: "Required." }]);
        if (!cityId) return res.clientError("City is required.", 422, [{ field: "cityId", message: "Required." }]);
        if (!name) return res.clientError("Area name is required.", 422, [{ field: "name", message: "Required." }]);

        const country = await Country.findOne({ _id: ObjectId(countryId), deletedAt: null });
        if (!country) return res.noRecords({ message: "Country not found." });

        const state = await State.findOne({ _id: ObjectId(stateId), countryId: country._id, deletedAt: null });
        if (!state) return res.noRecords({ message: "State not found for selected country." });

        const city = await City.findOne({ _id: ObjectId(cityId), countryId: country._id, stateId: state._id, deletedAt: null });
        if (!city) return res.noRecords({ message: "City not found for selected state." });

        const exists = await Area.findOne({ _id: { $ne: area._id }, countryId: country._id, stateId: state._id, cityId: city._id, name: { $regex: `^${escapeRegex(name)}$`, $options: "i" }, deletedAt: null });
        if (exists) throw new Error(`Area with name "${name}" already exists for selected city.`);

        await Area.updateOne(
            { _id: area._id },
            { countryId: country._id, stateId: state._id, cityId: city._id, name, isActive: Number(status) === 1 }
        );
        return res.successUpdate(area);
    } catch (error) {
        if (error.code === 11000) {
            return res.clientError("That area name is already in use for the selected city.", 409, [{ field: "name", message: "Area name already in use." }]);
        }
        return res.someThingWentWrong(error);
    }
};

export const deleteArea = async (req, res) => {
    try {
        const area = await Area.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!area) return res.noRecords();

        await area.updateOne({ deletedAt: moment().toISOString() });
        return res.successDelete(area);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getArea = async (req, res) => {
    try {
        let { limit, pageNo, query, status, countryId, stateId, cityId, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        sortBy = ["name", "countryName", "stateName", "cityName", "status", "createdAt"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (query) filter.name = { $regex: escapeRegex(String(query)), $options: "i" };
        if (status !== null && status !== undefined && status !== "") filter.isActive = Number(status) === 1;
        if (countryId) filter.countryId = ObjectId(countryId);
        if (stateId) filter.stateId = ObjectId(stateId);
        if (cityId) filter.cityId = ObjectId(cityId);

        const pipeline = [
            { $match: filter },
            { $lookup: { from: "countries", localField: "countryId", foreignField: "_id", as: "country" } },
            { $lookup: { from: "states", localField: "stateId", foreignField: "_id", as: "state" } },
            { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
            {
                $project: {
                    name: 1,
                    countryId: 1,
                    stateId: 1,
                    cityId: 1,
                    countryName: { $first: "$country.name" },
                    stateName: { $first: "$state.name" },
                    cityName: { $first: "$city.name" },
                    status: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];

        const [results, totalCount] = await Promise.all([Area.aggregate(resultsPipeline), Area.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo);
        }
        return res.datatableNoRecords();
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getSingleArea = async (req, res) => {
    try {
        const area = await Area.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!area) return res.noRecords();

        return res.success({ _id: area._id, countryId: area.countryId, stateId: area.stateId, cityId: area.cityId, name: area.name, status: area.isActive ? 1 : 0, createdAt: area.createdAt });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
