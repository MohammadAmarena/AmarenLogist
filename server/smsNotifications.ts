import { getDb } from "./db";
import { smsNotifications } from "../drizzle/schema";
import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_PHONE_NUMBER || "";

let twilio: Twilio | null = null;

function getTwilioClient(): Twilio {
  if (!twilio && accountSid && authToken) {
    twilio = new Twilio(accountSid, authToken);
  }
  return twilio as Twilio;
}

export interface SmsTemplate {
  type: string;
  message: (data: Record<string, any>) => string;
}

const SMS_TEMPLATES: Record<string, SmsTemplate> = {
  new_order: {
    type: "new_order",
    message: (data) =>
      `Neue Fahrzeugüberführung verfügbar! Von ${data.pickupLocation} nach ${data.destination}. Verdienst: €${data.earnings}. Annehmen: ${data.acceptUrl}`,
  },
  order_status_update: {
    type: "order_status_update",
    message: (data) =>
      `Ihr Auftrag ${data.orderNumber} hat einen neuen Status: ${data.status}. Details: ${data.detailsUrl}`,
  },
  payment_confirmation: {
    type: "payment_confirmation",
    message: (data) =>
      `Zahlung erhalten! €${data.amount} für Auftrag ${data.orderNumber}. Rechnung: ${data.invoiceUrl}`,
  },
  invoice_reminder: {
    type: "invoice_reminder",
    message: (data) =>
      `Zahlungserinnerung: Rechnung ${data.invoiceNumber} ist fällig. Betrag: €${data.amount}. Bezahlen: ${data.paymentUrl}`,
  },
  driver_assignment: {
    type: "driver_assignment",
    message: (data) =>
      `Fahrer zugewiesen! ${data.driverName} wird Ihr Fahrzeug überführen. Kontakt: ${data.driverPhone}`,
  },
  order_completed: {
    type: "order_completed",
    message: (data) =>
      `Auftrag abgeschlossen! Fahrzeug erfolgreich überführt. Bewertung: ${data.ratingUrl}`,
  },
};

/**
 * Send SMS notification
 */
export async function sendSmsNotification(
  userId: number,
  phoneNumber: string,
  messageType: string,
  templateData: Record<string, any>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const template = SMS_TEMPLATES[messageType];
    if (!template) {
      throw new Error(`Unknown SMS template: ${messageType}`);
    }

    const messageContent = template.message(templateData);

    // Log SMS notification
    const result = await db.insert(smsNotifications).values({
      userId,
      phoneNumber,
      messageType,
      messageContent,
      status: "pending",
    });

    const notificationId = (result as any).insertId;

    // Send SMS if Twilio is configured
    if (accountSid && authToken && fromNumber) {
      try {
        const client = getTwilioClient();
        const message = await client.messages.create({
          body: messageContent,
          from: fromNumber,
          to: phoneNumber,
        });

        // Update notification status
        const { eq } = await import("drizzle-orm");
        await db
          .update(smsNotifications)
          .set({
            status: "sent",
            externalId: message.sid,
            sentAt: new Date(),
          })
          .where(eq(smsNotifications.id, notificationId));

        console.log(`[SMS] Notification sent: ${message.sid} to ${phoneNumber}`);

        return {
          success: true,
          messageId: message.sid,
        };
      } catch (error) {
        console.error("[SMS] Failed to send SMS:", error);

        // Update notification status to failed
        const { eq: eq2 } = await import("drizzle-orm");
        await db
          .update(smsNotifications)
          .set({
            status: "failed",
            failureReason: String(error),
          })
          .where(eq2(smsNotifications.id, notificationId));

        return {
          success: false,
          error: String(error),
        };
      }
    } else {
      console.log("[SMS] Twilio not configured, SMS logged but not sent");
      return {
        success: true,
        messageId: `local-${notificationId}`,
      };
    }
  } catch (error) {
    console.error("[SMS] Error sending notification:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Send SMS to driver about new order
 */
export async function notifyDriverNewOrder(
  driverId: number,
  phoneNumber: string,
  orderData: {
    orderNumber: string;
    pickupLocation: string;
    destination: string;
    earnings: number;
    acceptUrl: string;
  }
): Promise<{ success: boolean; messageId?: string }> {
  return sendSmsNotification(driverId, phoneNumber, "new_order", orderData);
}

/**
 * Send SMS to client about payment
 */
export async function notifyClientPayment(
  clientId: number,
  phoneNumber: string,
  paymentData: {
    amount: number;
    orderNumber: string;
    invoiceUrl: string;
  }
): Promise<{ success: boolean; messageId?: string }> {
  return sendSmsNotification(clientId, phoneNumber, "payment_confirmation", paymentData);
}

/**
 * Send SMS to client about order status
 */
export async function notifyClientOrderStatus(
  clientId: number,
  phoneNumber: string,
  statusData: {
    orderNumber: string;
    status: string;
    detailsUrl: string;
  }
): Promise<{ success: boolean; messageId?: string }> {
  return sendSmsNotification(clientId, phoneNumber, "order_status_update", statusData);
}

/**
 * Get SMS notification history
 */
export async function getSmsHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { eq } = await import("drizzle-orm");
    const history = await db
      .select()
      .from(smsNotifications)
      .where(eq(smsNotifications.userId, userId))
      .limit(limit);

    return history;
  } catch (error) {
    console.error("[SMS] Failed to get history:", error);
    throw error;
  }
}

/**
 * Get SMS statistics
 */
export async function getSmsStatistics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const allNotifications = await db.select().from(smsNotifications);

    return {
      total: allNotifications.length,
      sent: allNotifications.filter((n) => n.status === "sent").length,
      failed: allNotifications.filter((n) => n.status === "failed").length,
      pending: allNotifications.filter((n) => n.status === "pending").length,
      delivered: allNotifications.filter((n) => n.status === "delivered").length,
    };
  } catch (error) {
    console.error("[SMS] Failed to get statistics:", error);
    throw error;
  }
}

/**
 * Configure SMS settings
 */
export async function configureSms(config: {
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
}): Promise<void> {
  if (config.accountSid) process.env.TWILIO_ACCOUNT_SID = config.accountSid;
  if (config.authToken) process.env.TWILIO_AUTH_TOKEN = config.authToken;
  if (config.phoneNumber) process.env.TWILIO_PHONE_NUMBER = config.phoneNumber;

  // Reset Twilio client
  twilio = null;

  console.log("[SMS] Configuration updated");
}
