import moment from "moment";
import { Address, City, Customer, State } from "../../models/index.js";
import { ObjectId, optionalNumber, toBoolean } from "../../helpers/utils.js";

const getCustomerOrFail = async (id) => {
    const customerId = ObjectId(id);
    if (!customerId) return null;

    return Customer.findOne({ _id: customerId, deletedAt: null });
};

export const getCustomerAddresses = async (req, res) => {
    try {
        const customer = await getCustomerOrFail(req.params.id);
        if (!customer) return res.noRecords({ message: "Customer not found." });

        const record = await Address.aggregate([
            { $match: { customerId: customer._id, deletedAt: null } },
            { $lookup: { from: "states", localField: "state", foreignField: "_id", as: "stateDoc" } },
            { $lookup: { from: "cities", localField: "city", foreignField: "_id", as: "cityDoc" } },
            { $unwind: "$stateDoc" },
            { $unwind: "$cityDoc" },
            {
                $project: {
                    customerId: 1,
                    addressLine1: 1,
                    addressLine2: 1,
                    landmark: 1,
                    state: 1,
                    city: 1,
                    stateName: { $ifNull: ["$stateDoc.name", '-'] },
                    cityName: { $ifNull: ["$cityDoc.name", '-'] },
                    pincode: 1,
                    latitude: 1,
                    longitude: 1,
                    isDefault: 1,
                    locationType: 1,
                    createdAt: 1
                }
            },
            { $sort: { isDefault: -1, createdAt: -1 } }
        ]);

        return res.success({
            customer: { _id: customer._id, name: customer.name, mobile: customer.mobile, email: customer.email },
            record
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createCustomerAddress = async (req, res) => {
    try {
        const customer = await getCustomerOrFail(req.params.id);
        if (!customer) return res.noRecords({ message: "Customer not found." });

        const { addressLine1, addressLine2, landmark, state, city, pincode, latitude, longitude, locationType = "home", isDefault = false } = req.body;

        const stateDoc = await State.findOne({ _id: ObjectId(state), deletedAt: null });
        if (!stateDoc) return res.noRecords({ message: "State not found." });

        const cityDoc = await City.findOne({ _id: ObjectId(city), stateId: stateDoc._id, deletedAt: null });
        if (!cityDoc) return res.noRecords({ message: "City not found for selected state." });

        if (isDefault) {
            await Address.updateMany({ customerId: customer._id, deletedAt: null }, { isDefault: false });
        }

        const address = await Address.create({
            customerId: customer._id,
            addressLine1: addressLine1,
            addressLine2: addressLine2 || null,
            landmark: landmark || null,
            state: stateDoc._id,
            city: cityDoc._id,
            pincode: pincode || null,
            latitude: optionalNumber(latitude),
            longitude: optionalNumber(longitude),
            locationType,
            isDefault: toBoolean(isDefault)
        });
        return res.successInsert(address);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateCustomerAddress = async (req, res) => {
    try {
        const customer = await getCustomerOrFail(req.params.id);
        if (!customer) return res.noRecords({ message: "Customer not found." });

        const address = await Address.findOne({ _id: ObjectId(req.params.addressId), customerId: customer._id, deletedAt: null });
        if (!address) return res.noRecords({ message: "Address not found." });

        const { addressLine1, addressLine2, landmark, state, city, pincode, latitude, longitude, locationType = "home", isDefault = false } = req.body;

        const stateDoc = await State.findOne({ _id: ObjectId(state), deletedAt: null });
        if (!stateDoc) return res.noRecords({ message: "State not found." });

        const cityDoc = await City.findOne({ _id: ObjectId(city), stateId: stateDoc._id, deletedAt: null });
        if (!cityDoc) return res.noRecords({ message: "City not found for selected state." });

        if (isDefault) {
            await Address.updateMany({ customerId: customer._id, deletedAt: null }, { isDefault: false });
        }

        await address.updateOne({
            addressLine1: addressLine1,
            addressLine2: addressLine2 || null,
            landmark: landmark || null,
            state: stateDoc._id,
            city: cityDoc._id,
            pincode: pincode || null,
            latitude: optionalNumber(latitude),
            longitude: optionalNumber(longitude),
            locationType,
            isDefault: toBoolean(isDefault)
        });
        return res.successUpdate(address);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteCustomerAddress = async (req, res) => {
    try {
        const customer = await getCustomerOrFail(req.params.id);
        if (!customer) return res.noRecords({ message: "Customer not found." });

        const address = await Address.findOne({ _id: ObjectId(req.params.addressId), customerId: customer._id, deletedAt: null });
        if (!address) return res.noRecords({ message: "Address not found." });

        await address.updateOne({ deletedAt: moment().toISOString(), isDefault: false });
        return res.successDelete(address);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
