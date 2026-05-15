import { ProviderService } from "../models/index.js";
import { ObjectId } from "../helpers/utils.js";
import { aggregateProviderServices, listActiveServiceTypesForCategory, loadServiceTypeForProviderCategory, parseProviderServicePrice } from "../helpers/providerServiceOps.js";

const providerSummary = (sp) => ({
    _id: sp._id,
    name: sp.name,
    mobile: sp.mobile,
    email: sp.email,
    serviceCategoryId: sp.serviceCategoryId
});

export const listMyProviderServices = async (req, res) => {
    try {
        const sp = req.serviceProvider;
        if (!sp.serviceCategoryId) {
            return res.clientError("Service category is not set on your profile. Contact support.", 422);
        }

        const rows = await aggregateProviderServices(sp._id);
        return res.success({ provider: providerSummary(sp), record: rows });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listMyServiceTypeOptions = async (req, res) => {
    try {
        const sp = req.serviceProvider;
        if (!sp.serviceCategoryId) {
            return res.clientError("Service category is not set on your profile. Contact support.", 422);
        }

        const limit = Number(req.query.limit);
        const record = await listActiveServiceTypesForCategory(sp.serviceCategoryId, {
            query: req.query.query,
            limit
        });

        return res.success({ record });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createMyProviderService = async (req, res) => {
    try {
        const sp = req.serviceProvider;
        if (!sp.serviceCategoryId) {
            return res.clientError("Service category is not set on your profile. Contact support.", 422);
        }

        const typeCheck = await loadServiceTypeForProviderCategory(req.body.serviceTypeId, sp.serviceCategoryId);
        if (typeCheck.error) {
            const e = typeCheck.error;
            return res.clientError(e.message, e.status, e.field ? [{ field: e.field, message: e.message }] : []);
        }

        const price = parseProviderServicePrice(req.body.price);
        if (price === null) {
            return res.clientError("Valid price is required.", 422, [{ field: "price", message: "Valid price is required." }]);
        }

        const serviceTypeId = typeCheck.serviceType._id;
        const exists = await ProviderService.findOne({ providerId: sp._id, serviceTypeId });
        if (exists) {
            return res.clientError("This service type is already added to your profile.", 409, [{ field: "serviceTypeId", message: "Already added." }]);
        }

        const doc = await ProviderService.create({
            providerId: sp._id,
            serviceTypeId,
            price,
            isActive: Number(req.body.status ?? 1) === 1
        });

        return res.successInsert(doc, "Service added.");
    } catch (error) {
        if (error.code === 11000) {
            return res.clientError("This service type is already added to your profile.", 409);
        }
        return res.someThingWentWrong(error);
    }
};

export const updateMyProviderService = async (req, res) => {
    try {
        const sp = req.serviceProvider;
        if (!sp.serviceCategoryId) {
            return res.clientError("Service category is not set on your profile. Contact support.", 422);
        }

        const doc = await ProviderService.findOne({ _id: ObjectId(req.params.serviceId), providerId: sp._id });
        if (!doc) return res.noRecords();

        const typeCheck = await loadServiceTypeForProviderCategory(req.body.serviceTypeId, sp.serviceCategoryId);
        if (typeCheck.error) {
            const e = typeCheck.error;
            return res.clientError(e.message, e.status, e.field ? [{ field: e.field, message: e.message }] : []);
        }

        const serviceTypeId = typeCheck.serviceType._id;
        const dup = await ProviderService.findOne({ _id: { $ne: doc._id }, providerId: sp._id, serviceTypeId });
        if (dup) {
            return res.clientError("This service type is already added to your profile.", 409, [{ field: "serviceTypeId", message: "Already added." }]);
        }

        const price = parseProviderServicePrice(req.body.price);
        if (price === null) {
            return res.clientError("Valid price is required.", 422, [{ field: "price", message: "Valid price is required." }]);
        }

        await doc.updateOne({ serviceTypeId, price, isActive: Number(req.body.status ?? 1) === 1 });
        return res.successUpdate(doc, "Service updated.");
    } catch (error) {
        if (error.code === 11000) {
            return res.clientError("This service type is already added to your profile.", 409);
        }
        return res.someThingWentWrong(error);
    }
};

export const deleteMyProviderService = async (req, res) => {
    try {
        const sp = req.serviceProvider;
        const doc = await ProviderService.findOne({ _id: ObjectId(req.params.serviceId), providerId: sp._id });
        if (!doc) return res.noRecords();

        await doc.deleteOne();
        return res.successDelete(undefined, "Service removed.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
