import { ProviderService, ServiceProvider } from "../../models/index.js";
import { ObjectId } from "../../helpers/utils.js";
import { aggregateProviderServices, loadServiceTypeForProviderCategory, parseProviderServicePrice } from "../../helpers/providerServiceOps.js";

const getProvider = async (id) => ServiceProvider.findOne({ _id: ObjectId(id), deletedAt: null }, "_id name mobile email cityId serviceCategoryId").lean();

export const getProviderServices = async (req, res) => {
    try {
        const provider = await getProvider(req.params.id);
        if (!provider) return res.noRecords();

        const rows = await aggregateProviderServices(provider._id);
        return res.success({ provider, record: rows });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createProviderService = async (req, res) => {
    try {
        const provider = await getProvider(req.params.id);
        if (!provider) return res.noRecords();

        const typeCheck = await loadServiceTypeForProviderCategory(req.body.serviceTypeId, provider.serviceCategoryId);
        if (typeCheck.error) {
            const e = typeCheck.error;
            return res.clientError(e.message, e.status, e.field ? [{ field: e.field, message: e.message }] : []);
        }

        const serviceTypeId = typeCheck.serviceType._id;
        const price = parseProviderServicePrice(req.body.price);
        if (price === null) return res.clientError("Valid price is required.", 422, [{ field: "price", message: "Valid price is required." }]);

        const exists = await ProviderService.findOne({ providerId: provider._id, serviceTypeId });
        if (exists) throw new Error("This service type is already added for the provider.");

        const doc = await ProviderService.create({
            providerId: provider._id,
            serviceTypeId,
            price,
            isActive: Number(req.body.status ?? 1) === 1
        });

        return res.successInsert(doc, "Provider service added.");
    } catch (error) {
        if (error.code === 11000) return res.clientError("This service type is already added for the provider.", 409);
        return res.someThingWentWrong(error);
    }
};

export const updateProviderService = async (req, res) => {
    try {
        const provider = await getProvider(req.params.id);
        if (!provider) return res.noRecords();

        const doc = await ProviderService.findOne({ _id: ObjectId(req.params.serviceId), providerId: provider._id });
        if (!doc) return res.noRecords();

        const typeCheck = await loadServiceTypeForProviderCategory(req.body.serviceTypeId, provider.serviceCategoryId);
        if (typeCheck.error) {
            const e = typeCheck.error;
            return res.clientError(e.message, e.status, e.field ? [{ field: e.field, message: e.message }] : []);
        }

        const serviceTypeId = typeCheck.serviceType._id;
        const dup = await ProviderService.findOne({ _id: { $ne: doc._id }, providerId: provider._id, serviceTypeId });
        if (dup) throw new Error("This service type is already added for the provider.");

        const price = parseProviderServicePrice(req.body.price);
        if (price === null) return res.clientError("Valid price is required.", 422, [{ field: "price", message: "Valid price is required." }]);

        await doc.updateOne({ serviceTypeId, price, isActive: Number(req.body.status ?? 1) === 1 });
        return res.successUpdate(doc, "Provider service updated.");
    } catch (error) {
        if (error.code === 11000) return res.clientError("This service type is already added for the provider.", 409);
        return res.someThingWentWrong(error);
    }
};

export const deleteProviderService = async (req, res) => {
    try {
        const provider = await getProvider(req.params.id);
        if (!provider) return res.noRecords();

        const doc = await ProviderService.findOne({ _id: ObjectId(req.params.serviceId), providerId: provider._id });
        if (!doc) return res.noRecords();

        await doc.deleteOne();
        return res.successDelete(undefined, "Provider service removed.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
