import { ServiceProvider, ServiceProviderPhoto } from "../../models/index.js";
import { deleteFile } from "../../libraries/storage.js";
import { ObjectId } from "../../helpers/utils.js";

export const getServiceProviderPhotos = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!provider) return res.noRecords();

        const rows = await ServiceProviderPhoto.find({ providerId: provider._id }).sort({ displayOrder: 1, createdAt: 1 }).lean();
        return res.success({ record: rows });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const uploadServiceProviderPhotos = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!provider) return res.noRecords();

        const files = req.files || [];
        if (!Array.isArray(files) || files.length === 0) {
            return res.someThingWentWrong({ message: "No image files were uploaded." });
        }

        const last = await ServiceProviderPhoto.findOne({ providerId: provider._id }, 'displayOrder').sort({ displayOrder: -1 }).lean();
        let nextOrder = (last?.displayOrder ?? -1) + 1;

        const created = [];
        for (const file of files) {
            if (!file?.filename) continue;

            const doc = await ServiceProviderPhoto.create({
                providerId: provider._id,
                photoUrl: `/service-provider-work/${file.filename}`,
                displayOrder: nextOrder++
            });

            created.push(doc.toObject());
        }

        if (!created.length) return res.someThingWentWrong({ message: "No valid images were saved." });

        return res.successInsert({ record: created }, "Photos uploaded.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteServiceProviderPhoto = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!provider) return res.noRecords();

        const doc = await ServiceProviderPhoto.findOne({ _id: ObjectId(req.params.photoId), providerId: provider._id });
        if (!doc) return res.noRecords();

        if (doc.photoUrl) deleteFile(doc.photoUrl);

        await doc.deleteOne();
        return res.successDelete(undefined, "Photo removed.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const reorderServiceProviderPhotos = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!provider) return res.noRecords();

        const { orderedIds } = req.body || {};
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.someThingWentWrong({ message: "orderedIds must be a non-empty array." });
        }

        const ids = orderedIds.map((x) => ObjectId(x)).filter(Boolean);
        if (ids.length !== orderedIds.length) {
            return res.someThingWentWrong({ message: "Invalid photo id in orderedIds." });
        }

        const existing = await ServiceProviderPhoto.find({ providerId: provider._id }, '_id').lean();
        if (existing.length !== ids.length) {
            return res.someThingWentWrong({ message: "Photo list does not match server state." });
        }

        const idSet = new Set(existing.map((r) => String(r._id)));
        for (const id of ids) {
            if (!idSet.has(String(id))) {
                return res.someThingWentWrong({ message: "Unknown photo id in orderedIds." });
            }
        }

        await Promise.all(ids.map((photoId, index) =>
            ServiceProviderPhoto.updateOne({ _id: photoId, providerId: provider._id }, { $set: { displayOrder: index } })
        ));

        const rows = await ServiceProviderPhoto.find({ providerId: provider._id }).sort({ displayOrder: 1, createdAt: 1 }).lean();
        return res.success(rows, "Order updated.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
