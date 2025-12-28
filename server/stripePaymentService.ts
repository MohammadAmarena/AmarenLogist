import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { orders, payments } from "../drizzle/schema";

// Initialize Stripe only if properly configured
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey && stripeKey !== "sk_test_dummy_key_for_development" && !stripeKey.includes("dummy") 
  ? new Stripe(stripeKey, {
      apiVersion: "2025-12-15.clover" as any,
    })
  : null;

/**
 * Stripe Payment Service
 * Handles payment processing, webhooks, and payouts
 */

export async function createCheckoutSession(
  orderId: number,
  clientId: number,
  totalAmount: number,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    // Development mode - return dummy response
    console.log("[Stripe] Not configured - returning dummy checkout session");
    return {
      success: true,
      sessionId: `dummy_session_${Date.now()}`,
      url: `${successUrl}?session_id=dummy&status=completed`,
      mode: "development",
    };
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get order details
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order[0]) throw new Error("Order not found");

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Fahrzeugüberführung: ${order[0].vehicleType}`,
            description: `Von ${order[0].pickupLocation} nach ${order[0].deliveryLocation}`,
          },
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: orderId.toString(),
      clientId: clientId.toString(),
    },
  });

  // Store payment record
  await db.insert(payments).values({
    orderId,
    clientId,
    amount: totalAmount.toString(),
    paymentMethod: "stripe",
    paymentIntentId: session.id,
    paymentStatus: "pending",
  });

  return {
    success: true,
    sessionId: session.id,
    url: session.url,
  };
}

export async function handlePaymentSuccess(sessionId: string) {
  if (!stripe) {
    // Development mode - simulate success
    console.log("[Stripe] Not configured - simulating payment success");
    return {
      success: true,
      orderId: 0,
      amount: "0.00",
      mode: "development",
    };
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get session details from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }

  // Get payment record
  const paymentRecords = await db
    .select()
    .from(payments)
    .where(eq(payments.paymentIntentId, sessionId))
    .limit(1);

  if (!paymentRecords[0]) {
    throw new Error("Payment record not found");
  }

  const payment = paymentRecords[0];

  // Update payment status
  await db
    .update(payments)
    .set({
      paymentStatus: "completed",
    })
    .where(eq(payments.id, payment.id));

  // Update order status
  await db
    .update(orders)
    .set({ status: "bestätigt" })
    .where(eq(orders.id, payment.orderId));

  return {
    success: true,
    orderId: payment.orderId,
    amount: payment.amount,
  };
}

export async function handlePaymentFailed(sessionId: string, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get payment record
  const paymentRecords = await db
    .select()
    .from(payments)
    .where(eq(payments.paymentIntentId, sessionId))
    .limit(1);

  if (!paymentRecords[0]) {
    throw new Error("Payment record not found");
  }

  const payment = paymentRecords[0];

  // Update payment status
  await db
    .update(payments)
    .set({
      paymentStatus: "failed",
    })
    .where(eq(payments.id, payment.id));

  return {
    success: true,
    orderId: payment.orderId,
  };
}

export async function refundPayment(paymentId: number, reason: string) {
  if (!stripe) {
    // Development mode - simulate refund
    console.log("[Stripe] Not configured - simulating refund");
    return {
      success: true,
      refundId: `dummy_refund_${Date.now()}`,
      amount: "0.00",
      mode: "development",
    };
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get payment record
  const paymentRecords = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!paymentRecords[0]) {
    throw new Error("Payment not found");
  }

  const payment = paymentRecords[0];

  if (!payment.paymentIntentId) {
    throw new Error("No transaction ID for refund");
  }

  // Create refund in Stripe
  const refund = await stripe.refunds.create({
    payment_intent: payment.paymentIntentId,
    reason: "requested_by_customer",
  });

  // Update payment status
  await db
    .update(payments)
    .set({
      paymentStatus: "refunded",
    })
    .where(eq(payments.id, paymentId));

  return {
    success: true,
    refundId: refund.id,
    amount: payment.amount,
  };
}

export async function createPayoutForDriver(
  driverId: number,
  amount: number,
  orderId: number
) {
  // In production, you would:
  // 1. Get driver's Stripe Connect account
  // 2. Create transfer to their account
  // 3. Store payout record

  return {
    success: true,
    payoutId: Math.random(),
    amount,
  };
}

export async function getPaymentHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(payments)
    .where(eq(payments.clientId, userId));
}

export async function getPaymentById(paymentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  return result[0] || null;
}

export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  if (!stripe) {
    // Development mode - return dummy event
    console.log("[Stripe] Not configured - returning dummy webhook event");
    return {
      type: "checkout.session.completed",
      data: { object: {} },
      id: "evt_dummy",
      object: "event",
    } as Stripe.Event;
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  try {
    return stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

export async function handleStripeWebhook(event: Stripe.Event) {
  if (!stripe) {
    console.log("[Stripe] Not configured - handling dummy webhook:", event.type);
    return { success: true, mode: "development", message: "Dummy webhook handled" };
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      return handlePaymentSuccess(session.id);

    case "charge.failed":
      const charge = event.data.object as Stripe.Charge;
      return handlePaymentFailed(
        charge.payment_intent?.toString() || "",
        charge.failure_message || "Unknown error"
      );

    case "charge.refunded":
      // Handle refund
      return { success: true };

    default:
      return { success: true, message: "Event type not handled" };
  }
}
