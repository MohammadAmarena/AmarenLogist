import nodemailer from "nodemailer";

// Konfiguriere SMTP-Transporter (verwende SendGrid oder Mailgun)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@amarenlogist.com";

export async function sendOrderConfirmationEmail(
  clientEmail: string,
  clientName: string,
  orderId: number,
  vehicleType: string,
  pickupLocation: string,
  deliveryLocation: string,
  totalPrice: number
) {
  const html = `
    <h2>Auftragsbestätigung - AmarenLogist</h2>
    <p>Hallo ${clientName},</p>
    <p>Ihr Auftrag wurde erfolgreich erstellt!</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Auftrag #${orderId}</strong></p>
      <p><strong>Fahrzeugtyp:</strong> ${vehicleType}</p>
      <p><strong>Von:</strong> ${pickupLocation}</p>
      <p><strong>Nach:</strong> ${deliveryLocation}</p>
      <p><strong>Gesamtpreis:</strong> €${totalPrice.toFixed(2)}</p>
    </div>
    <p>Ein Fahrer wird sich in Kürze um Ihren Auftrag kümmern. Sie erhalten eine Benachrichtigung, sobald ein Fahrer zugewiesen wurde.</p>
    <p>Mit freundlichen Grüßen,<br>Das AmarenLogist-Team</p>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `Auftragsbestätigung #${orderId} - AmarenLogist`,
      html,
    });
    console.log(`[Email] Auftragsbestätigung an ${clientEmail} versendet`);
  } catch (error) {
    console.error("[Email] Fehler beim Versand:", error);
  }
}

export async function sendNewOrderNotificationToDriver(
  driverEmail: string,
  driverName: string,
  orderId: number,
  vehicleType: string,
  pickupLocation: string,
  deliveryLocation: string,
  driverPayout: number
) {
  const html = `
    <h2>Neuer Auftrag verfügbar - AmarenLogist</h2>
    <p>Hallo ${driverName},</p>
    <p>Es gibt einen neuen Auftrag für Sie!</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Auftrag #${orderId}</strong></p>
      <p><strong>Fahrzeugtyp:</strong> ${vehicleType}</p>
      <p><strong>Von:</strong> ${pickupLocation}</p>
      <p><strong>Nach:</strong> ${deliveryLocation}</p>
      <p><strong>Ihre Auszahlung:</strong> €${driverPayout.toFixed(2)}</p>
    </div>
    <p><a href="https://amarenlogist.com/dashboard/driver" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Auftrag ansehen</a></p>
    <p>Mit freundlichen Grüßen,<br>Das AmarenLogist-Team</p>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: driverEmail,
      subject: `Neuer Auftrag #${orderId} - €${driverPayout.toFixed(2)} Auszahlung`,
      html,
    });
    console.log(`[Email] Neuer Auftrag an ${driverEmail} versendet`);
  } catch (error) {
    console.error("[Email] Fehler beim Versand:", error);
  }
}

export async function sendStatusUpdateEmail(
  recipientEmail: string,
  recipientName: string,
  orderId: number,
  status: string,
  driverName?: string
) {
  let subject = "";
  let statusText = "";

  switch (status) {
    case "bestätigt":
      subject = `Fahrer zugewiesen - Auftrag #${orderId}`;
      statusText = `Ihr Auftrag wurde bestätigt und ${driverName} wurde als Fahrer zugewiesen.`;
      break;
    case "unterwegs":
      subject = `Fahrt begonnen - Auftrag #${orderId}`;
      statusText = `Die Fahrzeugüberführung hat begonnen. Ihr Fahrzeug ist unterwegs.`;
      break;
    case "abgeschlossen":
      subject = `Überführung abgeschlossen - Auftrag #${orderId}`;
      statusText = `Ihre Fahrzeugüberführung wurde erfolgreich abgeschlossen!`;
      break;
    default:
      return;
  }

  const html = `
    <h2>Status-Update - AmarenLogist</h2>
    <p>Hallo ${recipientName},</p>
    <p>${statusText}</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Auftrag #${orderId}</strong></p>
      <p><strong>Status:</strong> ${status}</p>
      ${driverName ? `<p><strong>Fahrer:</strong> ${driverName}</p>` : ""}
    </div>
    <p><a href="https://amarenlogist.com/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Dashboard öffnen</a></p>
    <p>Mit freundlichen Grüßen,<br>Das AmarenLogist-Team</p>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject,
      html,
    });
    console.log(`[Email] Status-Update an ${recipientEmail} versendet`);
  } catch (error) {
    console.error("[Email] Fehler beim Versand:", error);
  }
}

export async function sendPayoutConfirmationEmail(
  driverEmail: string,
  driverName: string,
  orderId: number,
  amount: number,
  payoutDate: Date
) {
  const html = `
    <h2>Auszahlung bestätigt - AmarenLogist</h2>
    <p>Hallo ${driverName},</p>
    <p>Ihre Auszahlung für Auftrag #${orderId} wurde verarbeitet!</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Auftrag #${orderId}</strong></p>
      <p><strong>Auszahlungsbetrag:</strong> €${amount.toFixed(2)}</p>
      <p><strong>Auszahlungsdatum:</strong> ${payoutDate.toLocaleDateString("de-DE")}</p>
    </div>
    <p>Die Auszahlung sollte in 1-2 Werktagen auf Ihrem Bankkonto ankommen.</p>
    <p>Mit freundlichen Grüßen,<br>Das AmarenLogist-Team</p>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: driverEmail,
      subject: `Auszahlung bestätigt - €${amount.toFixed(2)}`,
      html,
    });
    console.log(`[Email] Auszahlungsbestätigung an ${driverEmail} versendet`);
  } catch (error) {
    console.error("[Email] Fehler beim Versand:", error);
  }
}

export async function sendAdminAlertEmail(
  adminEmail: string,
  alertType: string,
  details: string
) {
  const html = `
    <h2>Admin-Benachrichtigung - AmarenLogist</h2>
    <p><strong>Typ:</strong> ${alertType}</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      ${details}
    </div>
    <p><a href="https://amarenlogist.com/dashboard/admin" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Admin-Dashboard öffnen</a></p>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `[ALERT] ${alertType}`,
      html,
    });
    console.log(`[Email] Admin-Alert an ${adminEmail} versendet`);
  } catch (error) {
    console.error("[Email] Fehler beim Versand:", error);
  }
}
