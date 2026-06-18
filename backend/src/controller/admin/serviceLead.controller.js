import { Address, Booking, ProviderService, ServiceLead, ServiceProvider, AssignedSubscription } from "../../models/index.js";
import { ObjectId, escapeRegex } from "../../helpers/utils.js";
import { bookingStatusMail } from "../../libraries/mail.js";
import { notifyBookingStatusChange } from "../../helpers/bookingNotifications.js";
import moment from "moment";

export const listServiceLeads = async (req, res) => {
    try {
        let { limit, pageNo, query, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;
        const allowedSort = ["leadNumber", "customerName", "customerMobile", "cityName", "serviceCategoryName", "status", "scheduledTime", "createdAt", "assignedAt"];

        limit = limit ? parseInt(limit, 10) : 10;
        pageNo = pageNo ? parseInt(pageNo, 10) : 1;
        sortBy = allowedSort.includes(String(sortBy)) ? String(sortBy) : "createdAt";
        sortOrder = ["asc", "desc"].includes(String(sortOrder).toLowerCase()) ? String(sortOrder).toLowerCase() : "desc";

        const filter = { deletedAt: null };
        if (status && ["open", "assigned", "cancelled"].includes(status)) filter.status = status;

        const searchText = String(query || "").trim();
        const q = searchText ? escapeRegex(searchText) : "";

        const pipeline = [
            { $match: filter },
            { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
            { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
            { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
            { $lookup: { from: "serviceproviders", localField: "assignedProviderId", foreignField: "_id", as: "provider" } },
            {
                $project: {
                    leadNumber: 1,
                    status: 1,
                    scheduledTime: 1,
                    issueDescription: 1,
                    bookingId: 1,
                    assignedAt: 1,
                    createdAt: 1,
                    cityId: 1,
                    serviceCategoryId: 1,
                    customerName: { $ifNull: [{ $first: "$customer.name" }, ""] },
                    customerMobile: { $ifNull: [{ $first: "$customer.mobile" }, ""] },
                    customerEmail: { $ifNull: [{ $first: "$customer.email" }, ""] },
                    cityName: { $ifNull: [{ $first: "$city.name" }, ""] },
                    serviceCategoryName: { $ifNull: [{ $first: "$category.name" }, ""] },
                    assignedProviderName: { $ifNull: [{ $first: "$provider.name" }, ""] }
                }
            }
        ];

        if (q) {
            pipeline.push({
                $match: {
                    $or: [
                        { leadNumber: { $regex: q, $options: "i" } },
                        { issueDescription: { $regex: q, $options: "i" } },
                        { customerName: { $regex: q, $options: "i" } },
                        { customerMobile: { $regex: q, $options: "i" } },
                        { customerEmail: { $regex: q, $options: "i" } },
                        { cityName: { $regex: q, $options: "i" } },
                        { serviceCategoryName: { $regex: q, $options: "i" } },
                        { assignedProviderName: { $regex: q, $options: "i" } }
                    ]
                }
            });
        }

        const [record, totalCount] = await Promise.all([
            ServiceLead.aggregate([...pipeline, { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }]),
            ServiceLead.aggregate([...pipeline, { $count: "total_count" }])
        ]);

        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;
        if (record.length === 0) return res.datatableNoRecords();
        return res.pagination(record, total_count, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const getServiceLeadDetail = async (req, res) => {
    try {
        const id = ObjectId(req.params.id);
        if (!id) return res.noRecords(false, "Invalid lead.");

        const [row] = await ServiceLead.aggregate([
            { $match: { _id: id, deletedAt: null } },
            { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
            { $lookup: { from: "cities", localField: "cityId", foreignField: "_id", as: "city" } },
            { $lookup: { from: "servicecategories", localField: "serviceCategoryId", foreignField: "_id", as: "category" } },
            { $lookup: { from: "addresses", localField: "addressId", foreignField: "_id", as: "address" } },
            { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceTypes" } },
            { $lookup: { from: "serviceproviders", localField: "assignedProviderId", foreignField: "_id", as: "provider" } },
            {
                $project: {
                    leadNumber: 1,
                    status: 1,
                    scheduledTime: 1,
                    issueDescription: 1,
                    bookingId: 1,
                    assignedAt: 1,
                    createdAt: 1,
                    cityId: 1,
                    serviceCategoryId: 1,
                    customer: { $first: "$customer" },
                    city: { $first: "$city" },
                    category: { $first: "$category" },
                    address: { $first: "$address" },
                    serviceTypes: 1,
                    provider: { $first: "$provider" }
                }
            }
        ]);

        if (!row) return res.noRecords(false, "Lead not found.");
        return res.success(row);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const assignServiceLead = async (req, res) => {
    try {
        const lead = await ServiceLead.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!lead) return res.noRecords(false, "Lead not found.");
        if (lead.status !== "open") return res.clientError("This lead is no longer open for assignment.", 400);

        const provider = await ServiceProvider.findOne({
            _id: ObjectId(req.body.providerId),
            deletedAt: null,
            isActive: true,
            profileStatus: "approved",
            isVerified: true,
            cityId: lead.cityId,
            serviceCategoryId: lead.serviceCategoryId
        });
        if (!provider) return res.clientError("Provider not found or does not match this lead's city and service category.", 422, [{ field: "providerId", message: "Invalid provider for this lead." }]);

        const todayDate = moment().startOf("day").toDate();
        const subscription = await AssignedSubscription.findOne({ providerId: provider._id, status: "active", startDate: { $lte: todayDate }, endDate: { $gte: todayDate } });
        if (!subscription) return res.clientError("Provider is not active. Please assign a subscription to the provider.", 400);

        const selectedServiceTypeIds = lead.serviceTypeId.map((x) => x);

        const providerServices = await ProviderService.aggregate([
            { $match: { providerId: provider._id, serviceTypeId: { $in: selectedServiceTypeIds }, isActive: true } },
            { $lookup: { from: "servicetypes", localField: "serviceTypeId", foreignField: "_id", as: "serviceType" } },
            { $unwind: "$serviceType" },
            { $match: { "serviceType.deletedAt": null, "serviceType.isActive": true, "serviceType.categoryId": provider.serviceCategoryId } },
            { $project: { serviceTypeId: 1 } }
        ]);

        if (providerServices.length !== selectedServiceTypeIds.length) {
            return res.clientError("This provider does not offer all services requested on the lead.", 422, [{ field: "providerId", message: "Provider is missing one or more requested service types." }]);
        }

        const customerId = lead.customerId;
        const address = await Address.findOne({ _id: lead.addressId, customerId, deletedAt: null }).populate("city", "name").populate("state", "name");
        if (!address) return res.clientError("Customer address for this lead is no longer available.", 400);

        const booking = await Booking.create({
            customerId,
            providerId: provider._id,
            serviceCategoryId: provider.serviceCategoryId,
            serviceTypeId: selectedServiceTypeIds,
            cityId: provider.cityId,
            status: "price_pending",
            issueDescription: lead.issueDescription || null,
            scheduledTime: lead.scheduledTime,
            addressId: address._id,
            location: {
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                landmark: address.landmark,
                city: address.city?.name || null,
                state: address.state?.name || null,
                pincode: address.pincode,
                latitude: address.latitude,
                longitude: address.longitude,
                locationType: address.locationType
            }
        });

        lead.status = "assigned";
        lead.assignedProviderId = provider._id;
        lead.bookingId = booking._id;
        lead.assignedAt = new Date();
        await lead.save();

        await bookingStatusMail(booking._id);
        await notifyBookingStatusChange({ booking, previousStatus: null, actorType: "admin" });
        return res.successUpdate({ leadId: lead._id, leadNumber: lead.leadNumber, bookingId: booking._id, bookingNumber: booking.bookingNumber }, "Provider assigned and booking created.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const cancelServiceLead = async (req, res) => {
    try {
        const lead = await ServiceLead.findOne({ _id: ObjectId(req.params.id), deletedAt: null });
        if (!lead) return res.noRecords(false, "Lead not found.");
        if (lead.status === "cancelled") return res.clientError("This lead is already cancelled.", 400);
        if (lead.status === "assigned") {
            return res.clientError("Cannot cancel a lead that has been assigned. Cancel the booking from Bookings if needed.", 400);
        }

        if (lead.status !== "open") return res.clientError("Only open leads can be cancelled.", 400);

        lead.status = "cancelled";
        await lead.save();
        return res.successUpdate({ _id: lead._id, leadNumber: lead.leadNumber, status: lead.status }, "Lead marked as cancelled.");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
