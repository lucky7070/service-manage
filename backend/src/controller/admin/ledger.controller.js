import { Customer, Ledger } from "../../models/index.js";
import { ObjectId, escapeRegex } from "../../helpers/utils.js";

export const getCustomerLedger = async (req, res) => {
    try {

        const customer = await Customer.findOne({ _id: ObjectId(req.params.id), deletedAt: null }, { userId: 1, name: 1, mobile: 1, email: 1 });
        if (!customer) return res.noRecords(false, "Customer not found.");

        let { limit, pageNo, query, paymentType, paymentMethod } = req.query;
        limit = limit ? parseInt(limit) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;

        const filter = { customerId: customer._id };
        if (paymentType) filter.paymentType = Number(paymentType);
        if (paymentMethod) filter.paymentMethod = Number(paymentMethod);
        if (query) {
            const q = escapeRegex(String(query));
            filter.$or = [
                { voucherNo: { $regex: q, $options: "i" } },
                { particulars: { $regex: q, $options: "i" } }
            ];
        }

        const pipeline = [
            { $match: filter },
            { $lookup: { from: "admins", localField: "paidBy", foreignField: "_id", as: "admin" } },
            {
                $project: {
                    voucherNo: 1,
                    amount: 1,
                    currentBalance: 1,
                    updatedBalance: 1,
                    paymentType: 1,
                    paymentMethod: 1,
                    requestId: 1,
                    particulars: 1,
                    createdAt: 1
                }
            }
        ];

        const totalCountPipeline = [...pipeline, { $count: "total_count" }];
        const resultsPipeline = [...pipeline, { $sort: { createdAt: -1, _id: -1 } }, { $skip: (pageNo - 1) * limit }, { $limit: limit }];
        const [results, totalCount] = await Promise.all([Ledger.aggregate(resultsPipeline), Ledger.aggregate(totalCountPipeline)]);
        const total_count = totalCount.length > 0 ? totalCount[0].total_count : 0;

        if (results.length > 0) {
            return res.pagination(results, total_count, limit, pageNo, 3);
        } else {
            return res.datatableNoRecords();
        }
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createCustomerLedgerEntry = async (req, res) => {
    try {

        const customer = await Customer.findOne({ _id: ObjectId(req.params.id), deletedAt: null }, "userId name mobile email dateOfBirth image balance status createdAt");
        if (!customer) return res.noRecords(false, "Customer not found.");

        await customer.addLedger({
            amount: Number(req.body.amount),
            paymentType: Number(req.body.paymentType),
            paymentMethod: 5,
            particulars: String(req.body.particulars || "--").trim(),
            paidBy: req.admin?._id || null
        });

        return res.successInsert(customer);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
