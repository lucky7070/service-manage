import { AssignedSubscription, AutopaySubscription, Subscription } from "../models/index.js";
import { rupeesToPaise } from "./razorpay.js";
import { resolveProviderPurchaseSchedule } from "./subscriptionAssignment.js";
import { ObjectId } from "./utils.js";

const normalizePaymentStatus = (payment) => {
    const status = String(payment?.status || "").trim().toLowerCase();
    if (status === "captured" || payment?.captured === true || payment?.captured === 1 || payment?.captured === "1") {
        return "captured";
    }
    if (status === "failed") return "failed";
    return status;
};

export const withSession = (query, session) => (session ? query.session(session) : query);

/** First cycle is free trial (local assignment); Razorpay still collects mandate auth (token amount). */
export const isTrialMandateAuthAssignment = (assignment) =>
    Boolean(assignment?.isTrial) && Number(assignment?.paymentAmount) === 0;

/** Razorpay subscription.status values stored on AutopaySubscription.mandateStatus where possible. */
export const mapRazorpaySubscriptionStatusToMandate = (status) => {
    const key = String(status || "").trim().toLowerCase();
    const map = {
        authenticated: "authenticated",
        activated: "active",
        active: "active",
        pending: "pending",
        halted: "halted",
        paused: "paused",
        cancelled: "cancelled",
        completed: "completed",
        expired: "expired",
        created: "created",
    };
    return map[key] || "pending";
};

/** True when payment is the full plan cycle charge (post-trial or non-trial), not mandate token auth. */
export const isPaidPlanCyclePayment = (payment, planPriceWithTax) => {
    const expectedPaise = rupeesToPaise(Number(planPriceWithTax) || 0);
    return expectedPaise > 0 && Number(payment?.amount) === expectedPaise;
};

export const activateTrialAssignmentOnMandate = async ({
    assignment,
    autopay,
    subscription = null,
    paymentId = null,
    orderId = null,
    session = null,
}) => {
    if (!assignment || !autopay) {
        return { ok: false, message: "Assignment or autopay missing." };
    }

    if (!assignment.isTrial || Number(assignment.paymentAmount) !== 0) {
        return { ok: false, message: "Not a free trial assignment." };
    }

    if (assignment.paymentGatewayTransactionStatus === "success" && assignment.status === "active" && assignment.paymentGatewayTransactionId && assignment.paymentGatewayOrderId) {
        return { ok: true, alreadyProcessed: true, assignment, autopay };
    }

    if (paymentId) assignment.paymentGatewayTransactionId = String(paymentId).trim();
    if (orderId) assignment.paymentGatewayOrderId = String(orderId).trim();
    assignment.paymentGatewayTransactionStatus = "success";
    assignment.paymentGatewayTransactionMessage = "Free trial active. Mandate authorized; plan price charges after trial.";
    assignment.status = "active";
    await assignment.save({ session });

    const rzpStatus = String(subscription?.status || "").trim();
    autopay.mandateStatus = mapRazorpaySubscriptionStatusToMandate(rzpStatus || "authenticated");
    autopay.autoRenew = ["authenticated", "active", "activated"].includes(rzpStatus.toLowerCase()) || autopay.mandateStatus === "active";
    autopay.isTrial = true;
    autopay.cancelledAt = null;
    autopay.currentStart = assignment.startDate;
    autopay.currentEnd = assignment.endDate;
    if (subscription?.current_start) {
        autopay.currentStart = new Date(Number(subscription.current_start) * 1000);
    }
    if (subscription?.current_end) {
        autopay.currentEnd = new Date(Number(subscription.current_end) * 1000);
    }
    // Trial cycle has no paid charge yet
    await autopay.save({ session });

    return { ok: true, assignment, autopay };
};

export const syncAssignedSubscriptionFromRazorpayPayment = async ({ assignment, payment, session = null, autopay = null }) => {
    const razorpayOrderId = String(payment?.order_id || "").trim();
    const razorpayPaymentId = String(payment?.id || "").trim();
    const paymentStatus = normalizePaymentStatus(payment);

    if (!razorpayPaymentId || !paymentStatus) {
        return { ok: false, reason: "invalid_payment", assignment };
    }

    if (
        assignment.paymentGatewayTransactionStatus === "success"
        && assignment.paymentGatewayTransactionId === razorpayPaymentId
    ) {
        return { ok: true, alreadyProcessed: true, assignment };
    }

    // Trial: checkout auth (e.g. ₹5 UPI/card verify) is not the plan amount — activate access, no paidCount.
    if (isTrialMandateAuthAssignment(assignment)) {
        if (paymentStatus === "failed") {
            if (razorpayOrderId) assignment.paymentGatewayOrderId = razorpayOrderId;
            assignment.paymentGatewayTransactionId = razorpayPaymentId;
            assignment.paymentGatewayTransactionStatus = "failed";
            assignment.paymentGatewayTransactionMessage = String(payment.error_description || payment.error_reason || "Mandate authorization failed.").trim();
            await assignment.save({ session });
            return { ok: false, reason: "failed", assignment };
        }
        if (["authorized", "captured"].includes(paymentStatus)) {
            return activateTrialAssignmentOnMandate({
                assignment,
                autopay,
                paymentId: razorpayPaymentId,
                session,
            });
        }
        assignment.paymentGatewayTransactionStatus = "pending";
        assignment.paymentGatewayTransactionMessage = "Awaiting mandate authorization.";
        await assignment.save({ session });
        return { ok: false, reason: "pending", assignment };
    }

    if (razorpayOrderId) assignment.paymentGatewayOrderId = razorpayOrderId;
    assignment.paymentGatewayTransactionId = razorpayPaymentId;

    if (paymentStatus === "failed") {
        assignment.paymentGatewayTransactionStatus = "failed";
        assignment.paymentGatewayTransactionMessage = String(payment.error_description || payment.error_reason || "Payment failed.").trim();
        await assignment.save({ session });
        return { ok: false, reason: "failed", assignment };
    }

    const expectedPaise = rupeesToPaise(assignment.paymentAmount);
    if (Number(payment.amount) !== expectedPaise) {
        assignment.paymentGatewayTransactionStatus = "failed";
        assignment.paymentGatewayTransactionMessage = "Payment amount mismatch.";
        await assignment.save({ session });
        return { ok: false, reason: "amount_mismatch", assignment };
    }

    if (paymentStatus === "captured") {
        assignment.paymentGatewayTransactionStatus = "success";
        assignment.paymentGatewayTransactionMessage = "Payment successful.";
        assignment.status = "active";
        await assignment.save({ session });

        if (autopay) {
            autopay.mandateStatus = "active";
            autopay.autoRenew = true;
            autopay.paidCount = Number(autopay.paidCount || 0) + 1;
            autopay.currentStart = assignment.startDate;
            autopay.currentEnd = assignment.endDate;
            await autopay.save({ session });
        }

        return { ok: true, assignment, autopay };
    }

    assignment.paymentGatewayTransactionStatus = "pending";
    assignment.paymentGatewayTransactionMessage = "Payment not captured yet.";
    await assignment.save({ session });
    return { ok: false, reason: "pending", assignment };
};

export const findAutopayByRazorpaySubscriptionId = async (razorpaySubscriptionId, session = null) => {
    const query = AutopaySubscription.findOne({ razorpaySubscriptionId: String(razorpaySubscriptionId || "").trim() });
    return withSession(query, session);
};

export const findPendingAssignmentByAutopay = async (autopaySubscriptionId, session = null) => {
    const query = AssignedSubscription.findOne({ autopaySubscriptionId, paymentGatewayTransactionStatus: "pending" }).sort({ createdAt: -1 });
    return withSession(query, session);
};

export const resolveAssignmentForPaymentWebhook = async ({ payment, session = null }) => {
    const razorpayOrderId = String(payment?.order_id || "").trim();
    const razorpaySubscriptionId = String(payment?.subscription_id || "").trim();
    const razorpayPaymentId = String(payment?.id || "").trim();
    const amountPaise = Number(payment?.amount);

    if (razorpayPaymentId) {
        const existing = await withSession(AssignedSubscription.findOne({ paymentGatewayTransactionId: razorpayPaymentId }), session);
        if (existing) {
            const autopay = existing.autopaySubscriptionId ? await withSession(AutopaySubscription.findById(existing.autopaySubscriptionId), session) : null;
            return {
                assignment: existing,
                autopay,
                alreadyProcessed: existing.paymentGatewayTransactionStatus === "success",
            };
        }
    }

    if (razorpayOrderId) {
        const existing = await withSession(AssignedSubscription.findOne({ paymentGatewayOrderId: razorpayOrderId }), session);
        if (existing) {
            const autopay = existing.autopaySubscriptionId ? await withSession(AutopaySubscription.findById(existing.autopaySubscriptionId), session) : null;
            return { assignment: existing, autopay };
        }
    }

    if (razorpaySubscriptionId) {
        const autopay = await findAutopayByRazorpaySubscriptionId(razorpaySubscriptionId, session);
        if (autopay) {
            const assignment = await findPendingAssignmentByAutopay(autopay._id, session);
            if (assignment) {
                if (isTrialMandateAuthAssignment(assignment) && Number.isFinite(amountPaise) && amountPaise > 0) {
                    const plan = await withSession(Subscription.findOne({ _id: assignment.subscriptionId, deletedAt: null }), session);
                    if (isPaidPlanCyclePayment(payment, Number(plan?.priceWithTax) || 0)) {
                        return { assignment: null, autopay: null };
                    }
                }
                return { assignment, autopay };
            }
        }
    }

    // Autopay first charge: payment may have order/invoice but no subscription_id yet
    if (Number.isFinite(amountPaise) && amountPaise > 0) {
        const pendingAutopayAssignments = await withSession(AssignedSubscription.find({ paymentGatewayTransactionStatus: "pending", autopaySubscriptionId: { $ne: null } }).sort({ createdAt: -1 }).limit(10), session);
        const matched = pendingAutopayAssignments.find((row) => rupeesToPaise(row.paymentAmount) === amountPaise);
        if (matched) {
            const autopay = await withSession(AutopaySubscription.findById(matched.autopaySubscriptionId), session);
            return { assignment: matched, autopay };
        }
    }

    return { assignment: null, autopay: null };
};

export const createRenewalAssignmentFromCharge = async ({ autopay, plan, session = null }) => {
    const { startDate, endDate } = await resolveProviderPurchaseSchedule(autopay.providerId, plan, session);
    const paymentAmount = Number(plan.priceWithTax) || 0;

    const [assignment] = await AssignedSubscription.create([{
        providerId: autopay.providerId,
        subscriptionId: plan._id,
        autopaySubscriptionId: autopay._id,
        startDate,
        endDate,
        status: "inactive",
        amount: Number(plan.price) || 0,
        taxAmount: Number(plan.price) * (plan.taxPercentage || 0) / 100,
        taxPercentage: plan.taxPercentage || 0,
        paymentAmount,
        paymentGatewayTransactionStatus: "pending",
        isTrial: false,
        assignedBy: null,
    }], { session });

    return assignment;
};

export const processSubscriptionCharged = async ({ razorpaySubscriptionId, payment, subscription = null, session = null }) => {
    const rzpSubscriptionId = String(razorpaySubscriptionId || payment?.subscription_id || subscription?.id || "").trim();
    const razorpayPaymentId = String(payment?.id || "").trim();
    if (!rzpSubscriptionId || !payment || !razorpayPaymentId) {
        return { ok: false, reason: "invalid_payload" };
    }

    const existingByPayment = await withSession(AssignedSubscription.findOne({ paymentGatewayTransactionId: razorpayPaymentId }), session);
    if (existingByPayment) {
        return { ok: true, alreadyProcessed: true, assignment: existingByPayment };
    }

    let autopay = await findAutopayByRazorpaySubscriptionId(rzpSubscriptionId, session);

    // Fallback: notes.autopaySubscriptionId from Razorpay subscription entity
    if (!autopay) {
        const notesAutopayId = String(subscription?.notes?.autopaySubscriptionId || "").trim();
        if (notesAutopayId) {
            try {
                autopay = await withSession(AutopaySubscription.findById(ObjectId(notesAutopayId)), session);
                if (autopay && !autopay.razorpaySubscriptionId) {
                    autopay.razorpaySubscriptionId = rzpSubscriptionId;
                    await autopay.save({ session });
                }
            } catch {
                // invalid id
            }
        }
    }

    if (!autopay) {
        return { ok: false, reason: "no_autopay" };
    }

    const plan = await withSession(Subscription.findOne({ _id: autopay.subscriptionId, deletedAt: null }), session);
    const planPriceWithTax = Number(plan?.priceWithTax) || 0;

    let assignment = await findPendingAssignmentByAutopay(autopay._id, session);

    // Post-trial plan charge must not reuse the free-trial assignment row.
    if (assignment && isTrialMandateAuthAssignment(assignment) && isPaidPlanCyclePayment(payment, planPriceWithTax)) {
        assignment = null;
    }

    // Fallback: notes.assignmentId for first charge (non-trial legacy path)
    if (!assignment) {
        const notesAssignmentId = String(subscription?.notes?.assignmentId || "").trim();
        if (notesAssignmentId) {
            try {
                const notesAssignment = await withSession(AssignedSubscription.findOne({
                    _id: ObjectId(notesAssignmentId),
                    paymentGatewayTransactionStatus: "pending",
                }), session);
                if (notesAssignment) {
                    if (isTrialMandateAuthAssignment(notesAssignment) && isPaidPlanCyclePayment(payment, planPriceWithTax)) {
                        assignment = null;
                    } else {
                        assignment = notesAssignment;
                    }
                }
            } catch {
                // invalid id
            }
        }
    }

    let isRenewal = false;
    if (!assignment) {
        if (!plan) {
            return { ok: false, reason: "plan_not_found" };
        }

        assignment = await createRenewalAssignmentFromCharge({ autopay, plan, session });
        isRenewal = true;
    }

    const paymentWithSubscription = payment.subscription_id ? payment : { ...payment, subscription_id: rzpSubscriptionId };
    const result = await syncAssignedSubscriptionFromRazorpayPayment({
        assignment,
        payment: paymentWithSubscription,
        session,
        autopay,
    });

    return { ...result, assignment, autopay, isRenewal };
};

export const processSubscriptionMandateUpdate = async ({ razorpaySubscriptionId, status, subscription = null, session = null }) => {
    const rzpSubscriptionId = String(razorpaySubscriptionId || "").trim();
    if (!rzpSubscriptionId || !status) {
        return { ok: false, reason: "invalid_payload" };
    }

    const mandateStatusMap = {
        authenticated: "authenticated",
        activated: "active",
        active: "active",
        cancelled: "cancelled",
        halted: "halted",
        pending: "pending",
        paused: "paused",
        resumed: "active",
        completed: "completed",
        expired: "expired",
        created: "created",
    };

    const mandateStatus = mandateStatusMap[String(status).toLowerCase()];
    if (!mandateStatus) {
        return { ok: false, reason: "ignored_status" };
    }

    let autopay = await findAutopayByRazorpaySubscriptionId(rzpSubscriptionId, session);
    if (!autopay) {
        const notesAutopayId = String(subscription?.notes?.autopaySubscriptionId || "").trim();
        if (notesAutopayId) {
            try {
                autopay = await withSession(AutopaySubscription.findById(ObjectId(notesAutopayId)), session);
            } catch {
                // invalid id
            }
        }
    }

    if (!autopay) {
        return { ok: false, reason: "no_autopay" };
    }

    autopay.mandateStatus = mandateStatus;
    if (!autopay.razorpaySubscriptionId) autopay.razorpaySubscriptionId = rzpSubscriptionId;

    if (mandateStatus === "cancelled" || mandateStatus === "halted" || mandateStatus === "paused") {
        autopay.autoRenew = false;
        autopay.cancelledAt = new Date();
    } else if (mandateStatus === "active" || mandateStatus === "authenticated") {
        autopay.autoRenew = true;
        autopay.cancelledAt = null;
    }

    if (subscription?.current_start) {
        autopay.currentStart = new Date(Number(subscription.current_start) * 1000);
    }
    if (subscription?.current_end) {
        autopay.currentEnd = new Date(Number(subscription.current_end) * 1000);
    }
    if (subscription?.paid_count != null) {
        autopay.paidCount = Number(subscription.paid_count) || autopay.paidCount;
    }

    await autopay.save({ session });

    // Free trial: grant access when mandate is authenticated (before first paid charge)
    let trialActivated = false;
    if (mandateStatus === "active" || mandateStatus === "authenticated") {
        const pendingTrial = await findPendingAssignmentByAutopay(autopay._id, session);
        if (pendingTrial?.isTrial && Number(pendingTrial.paymentAmount) === 0) {
            const trialResult = await activateTrialAssignmentOnMandate({
                assignment: pendingTrial,
                autopay,
                subscription,
                session,
            });
            trialActivated = Boolean(trialResult.ok);
        }
    }

    return { ok: true, mandateStatus, autopay, trialActivated };
};
