import logger from "../helpers/logger.js";
import moment from "moment";
import { AssignedSubscription } from "../models/index.js";
import { getRazorpayOrderStatus, getRazorpayClient, rupeesToPaise } from "../helpers/razorpay.js";

export const syncRazorpayPendingPayments = async () => {
    try {

        const batchSize = 10;
        const pendingAssignments = await AssignedSubscription.find({
            paymentGatewayTransactionStatus: "pending",
            paymentGatewayOrderId: { $ne: null },
            createdAt: {
                $lte: moment().subtract(15, 'minutes').toDate(),
                $gte: moment().subtract(3, 'hours').toDate()
            },
        }).sort({ createdAt: 1 }).limit(batchSize).lean();

        const toUpdate = [];
        if (pendingAssignments.length > 0) {
            for (const assignment of pendingAssignments) {
                try {
                    const orderId = String(assignment.paymentGatewayOrderId || "").trim();
                    if (!orderId) continue;

                    const payment = await getRazorpayOrderStatus(orderId);
                    if (!payment || !["captured", "failed"].includes(payment.status)) continue;

                    const obj = { paymentGatewayTransactionId: String(payment.id || "").trim() }
                    if (payment.status === "failed") {
                        obj.paymentGatewayTransactionStatus = "failed";
                        obj.paymentGatewayTransactionMessage = String(payment.error_description || payment.error_reason || "Payment failed.").trim();
                    } else if (Number(payment.amount) !== rupeesToPaise(assignment.paymentAmount)) {
                        obj.paymentGatewayTransactionStatus = "failed";
                        obj.paymentGatewayTransactionMessage = "Payment amount mismatch.";
                    } else if (payment.status === "captured") {
                        obj.paymentGatewayTransactionStatus = "success";
                        obj.paymentGatewayTransactionMessage = "Payment successful.";
                        obj.status = "active";
                    }

                    if (Object.keys(obj).length > 1) toUpdate.push({ updateOne: { filter: { _id: assignment._id }, update: { $set: obj } } });
                } catch (error) {
                    logger.error('Error syncing Razorpay pending payment..!!', error);
                    continue;
                }
            }
        }

        if (toUpdate.length > 0) await AssignedSubscription.bulkWrite(toUpdate);

        logger.cron(`Razorpay pending ${toUpdate.length} payments synced successfully..!!`);
    } catch (error) {
        logger.error('Razorpay pending payments sync failed..!!', error);
    }
};
