import logger from "../helpers/logger.js";
import moment from "moment";
import { AssignedSubscription, AutopaySubscription } from "../models/index.js";
import { getRazorpayOrderStatus, getRazorpaySubscription, getRazorpaySubscriptionLatestPayment, rupeesToPaise } from "../helpers/razorpay.js";
import {
    activateTrialAssignmentOnMandate,
    isTrialMandateAuthAssignment,
    mapRazorpaySubscriptionStatusToMandate,
} from "../helpers/subscriptionPayment.js";

const buildPendingPaymentUpdate = (assignment, payment) => {
    if (isTrialMandateAuthAssignment(assignment)) return null;

    const obj = { paymentGatewayTransactionId: String(payment.id || "").trim() };
    if (payment.status === "failed") {
        obj.paymentGatewayTransactionStatus = "failed";
        obj.paymentGatewayTransactionMessage = String(payment.error_description || payment.error_reason || "Payment failed.").trim();
    } else if (Number(payment.amount) !== rupeesToPaise(assignment.paymentAmount)) {
        obj.paymentGatewayTransactionStatus = "failed";
        obj.paymentGatewayTransactionMessage = "Payment amount mismatch..!!";
    } else if (payment.status === "captured") {
        obj.paymentGatewayTransactionStatus = "success";
        obj.paymentGatewayTransactionMessage = "Payment successful..!!";
        obj.status = "active";
    }

    return Object.keys(obj).length > 1 ? obj : null;
};

export const syncRazorpayPendingPayments = async () => {
    try {
        const batchSize = 10;
        const pendingAssignments = await AssignedSubscription.aggregate([
            {
                $match: {
                    paymentGatewayTransactionStatus: "pending",
                    $or: [
                        { paymentGatewayOrderId: { $ne: null } },
                        { autopaySubscriptionId: { $ne: null } },
                    ],
                    createdAt: {
                        $lte: moment().subtract(15, "minutes").toDate(),
                        $gte: moment().subtract(3, "hours").toDate(),
                    },
                },
            },
            { $sample: { size: batchSize } },
        ]);

        const toUpdate = [];
        const autopayUpdates = [];
        let trialSynced = 0;

        if (pendingAssignments.length > 0) {
            for (const assignment of pendingAssignments) {
                try {
                    if (isTrialMandateAuthAssignment(assignment) && assignment.autopaySubscriptionId) {
                        const autopayDoc = await AutopaySubscription.findById(assignment.autopaySubscriptionId);
                        if (!autopayDoc) continue;

                        const subscriptionId = String(autopayDoc.razorpaySubscriptionId || "").trim();
                        const subscription = subscriptionId ? await getRazorpaySubscription(subscriptionId) : null;
                        const rzpStatus = String(subscription?.status || "").toLowerCase();

                        if (!subscription || !["authenticated", "active", "activated"].includes(rzpStatus)) {
                            continue;
                        }

                        const assignmentDoc = await AssignedSubscription.findById(assignment._id);
                        if (!assignmentDoc || assignmentDoc.paymentGatewayTransactionStatus === "success") continue;

                        const authPayment = await getRazorpaySubscriptionLatestPayment(String(assignment._id));
                        const result = await activateTrialAssignmentOnMandate({
                            assignment: assignmentDoc,
                            autopay: autopayDoc,
                            subscription,
                            paymentId: authPayment?.id || null,
                            orderId: authPayment?.order_id || null,
                            session: null,
                        });

                        if (result.ok) trialSynced += 1;
                        continue;
                    }

                    let payment = null;
                    const orderId = String(assignment.paymentGatewayOrderId || "").trim();

                    if (orderId) {
                        payment = await getRazorpayOrderStatus(orderId);
                    } else if (assignment._id) {
                        payment = await getRazorpaySubscriptionLatestPayment(assignment._id);
                    }

                    if (!payment || !["captured", "failed"].includes(payment.status)) continue;

                    const obj = buildPendingPaymentUpdate(assignment, payment);
                    if (!obj) continue;

                    const isAutopay = Boolean(assignment.autopaySubscriptionId);
                    const isSuccess = obj.paymentGatewayTransactionStatus === "success";

                    if (isAutopay && isSuccess) {
                        const autopay = await AutopaySubscription.findById(assignment.autopaySubscriptionId).lean();
                        const subscriptionId = String(autopay?.razorpaySubscriptionId || "").trim();
                        const subscription = subscriptionId ? await getRazorpaySubscription(subscriptionId) : null;

                        if (!autopay || !subscription) {
                            logger.error(`Skipping assignment ${assignment._id}: autopay/subscription fetch failed.`);
                            continue;
                        }

                        toUpdate.push({ updateOne: { filter: { _id: assignment._id }, update: { $set: obj } } });
                        autopayUpdates.push({
                            updateOne: {
                                filter: { _id: autopay._id },
                                update: {
                                    $set: {
                                        mandateStatus: mapRazorpaySubscriptionStatusToMandate(subscription.status),
                                        autoRenew: String(subscription.status || "").toLowerCase() === "active",
                                    },
                                    $inc: { paidCount: 1 },
                                },
                            },
                        });
                        continue;
                    }

                    toUpdate.push({ updateOne: { filter: { _id: assignment._id }, update: { $set: obj } } });
                } catch (error) {
                    logger.error("Error syncing Razorpay pending payment..!!", error);
                    continue;
                }
            }
        }

        if (toUpdate.length > 0) await AssignedSubscription.bulkWrite(toUpdate);
        if (autopayUpdates.length > 0) await AutopaySubscription.bulkWrite(autopayUpdates);

        logger.cron(`Razorpay pending ${toUpdate.length} payments synced (${trialSynced} trial mandates).`);
    } catch (error) {
        logger.error("Razorpay pending payments sync failed..!!", error);
    }
};
