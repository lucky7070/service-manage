import { rupeesToPaise } from "./razorpay.js";

export const syncAssignedSubscriptionFromRazorpayPayment = async ({ assignment, payment, session = null }) => {
    const razorpayOrderId = String(payment?.order_id || "").trim();
    const razorpayPaymentId = String(payment?.id || "").trim();
    const paymentStatus = String(payment?.status || "").trim();

    if (!razorpayOrderId || !razorpayPaymentId || !paymentStatus) {
        return { ok: false, reason: "invalid_payment", assignment };
    }

    if (
        assignment.paymentGatewayTransactionStatus === "success"
        && assignment.paymentGatewayTransactionId === razorpayPaymentId
    ) {
        return { ok: true, alreadyProcessed: true, assignment };
    }

    assignment.paymentGatewayOrderId = razorpayOrderId;
    assignment.paymentGatewayTransactionId = razorpayPaymentId;

    if (paymentStatus === "failed") {
        assignment.paymentGatewayTransactionStatus = "failed";
        assignment.paymentGatewayTransactionMessage = String(payment.error_description || payment.error_reason || "Payment failed.").trim();
        await assignment.save({ session });
        return { ok: false, reason: "failed", assignment };
    }

    if (Number(payment.amount) !== rupeesToPaise(assignment.paymentAmount)) {
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
        return { ok: true, assignment };
    }

    assignment.paymentGatewayTransactionStatus = "pending";
    assignment.paymentGatewayTransactionMessage = "Payment not captured yet.";
    await assignment.save({ session });
    return { ok: false, reason: "pending", assignment };
};
