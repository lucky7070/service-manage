import logger from "../helpers/logger.js";
import moment from "moment";
import { AssignedSubscription, AutopaySubscription } from "../models/index.js";
import { getRazorpayOrderStatus, getRazorpaySubscriptionLatestPayment, rupeesToPaise } from "../helpers/razorpay.js";

const buildPendingPaymentUpdate = (assignment, payment) => {
    const obj = { paymentGatewayTransactionId: String(payment.id || "").trim() };
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

    return Object.keys(obj).length > 1 ? obj : null;
};

export const syncRazorpayPendingPayments = async () => {
    try {

        const batchSize = 10;
        const pendingAssignments = await AssignedSubscription.find({
            paymentGatewayTransactionStatus: "pending",
            $or: [
                { paymentGatewayOrderId: { $ne: null } },
                { autopaySubscriptionId: { $ne: null } },
            ],
            createdAt: {
                $lte: moment().subtract(15, "minutes").toDate(),
                $gte: moment().subtract(3, "hours").toDate(),
            },
        }).sort({ createdAt: 1 }).limit(batchSize).lean();

        const toUpdate = [];
        const autopayUpdates = [];

        if (pendingAssignments.length > 0) {
            for (const assignment of pendingAssignments) {
                try {
                    let payment = null;
                    const orderId = String(assignment.paymentGatewayOrderId || "").trim();
                    let autopay = null;

                    if (assignment.autopaySubscriptionId) {
                        autopay = await AutopaySubscription.findById(assignment.autopaySubscriptionId).lean();
                        const subscriptionId = String(autopay?.razorpaySubscriptionId || "").trim();
                        if (subscriptionId) {
                            payment = await getRazorpaySubscriptionLatestPayment(subscriptionId);
                        }
                    } else if (orderId) {
                        payment = await getRazorpayOrderStatus(orderId);
                    }

                    if (!payment || !["captured", "failed"].includes(payment.status)) continue;

                    const obj = buildPendingPaymentUpdate(assignment, payment);
                    if (obj) {
                        toUpdate.push({ updateOne: { filter: { _id: assignment._id }, update: { $set: obj } } });

                        if (obj.paymentGatewayTransactionStatus === "success" && autopay) {
                            autopayUpdates.push({
                                updateOne: {
                                    filter: { _id: autopay._id },
                                    update: {
                                        $set: {
                                            mandateStatus: "active",
                                            autoRenew: true,
                                            currentStart: assignment.startDate,
                                            currentEnd: assignment.endDate,
                                        },
                                        $inc: { paidCount: 1 },
                                    },
                                },
                            });
                        }
                    }
                } catch (error) {
                    logger.error("Error syncing Razorpay pending payment..!!", error);
                    continue;
                }
            }
        }

        if (toUpdate.length > 0) await AssignedSubscription.bulkWrite(toUpdate);
        if (autopayUpdates.length > 0) await AutopaySubscription.bulkWrite(autopayUpdates);

        logger.cron(`Razorpay pending ${toUpdate.length} payments synced successfully..!!`);
    } catch (error) {
        logger.error('Razorpay pending payments sync failed..!!', error);
    }
};
