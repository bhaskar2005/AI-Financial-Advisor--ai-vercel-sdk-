// utils/email.ts
import nodemailer from "nodemailer";
import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Email types that should use Resend
type EmailType =
  | "welcomeGeneral"
  | "expertApplicationPending"
  | "adminNotification";

// Configuration for which email types use Resend vs SMTP
const EMAIL_SERVICE_CONFIG = {
  welcomeGeneral: "resend",
  expertApplicationPending: "resend",
  adminNotification: "smtp",
} as const;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASSWORD must be set in environment variables"
    );
  }

  return nodemailer.createTransport({
    host: "smtp.hostinger.com", // Hostinger SMTP server
    port: 587, // Use port 587 for better deliverability
    secure: false, // false for 587, true for 465
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    // Additional options to improve deliverability
    pool: true, // Use pooled connections
    rateLimit: 14, // Limit to 14 emails per second
  });
};

// Send email using Resend
async function sendWithResend(
  options: EmailOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const result = await resend.emails.send({
      from: "Waiveer Team <service@waiveer.com>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
      headers: {
        "X-Mailer": "Waiveer Platform via Resend",
        "Reply-To": "service@waiveer.com",
      },
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log("[Email] Resend message sent successfully:", result.data?.id);
    return { success: true };
  } catch (error) {
    console.error("[Email] Resend failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown Resend error",
    };
  }
}

// Send email using SMTP (Hostinger)
async function sendWithSMTP(
  options: EmailOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Waiveer Team" <service@waiveer.com>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
      // Additional headers to improve deliverability and DKIM validation
      headers: {
        "X-Mailer": "Waiveer Platform v1.0",
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        Importance: "Normal",
        "List-Unsubscribe": `<mailto:service@waiveer.com?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "Message-ID": `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@waiveer.com>`,
        "Reply-To": "service@waiveer.com",
        "Return-Path": "service@waiveer.com",
        Organization: "Waiveer",
        "X-Auto-Response-Suppress": "OOF, DR, RN, NRN, AutoReply",
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[Email] SMTP message sent successfully:", info.messageId);

    return { success: true };
  } catch (error) {
    console.error("[Email] SMTP failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown SMTP error",
    };
  }
}

// Main send email function with intelligent routing and fallback
export async function sendEmail(
  options: EmailOptions,
  emailType?: EmailType
): Promise<{ success: boolean; error?: string; service?: string }> {
  // Determine which service to use based on email type
  const useResend = emailType && EMAIL_SERVICE_CONFIG[emailType] === "resend";

  if (useResend) {
    console.log(
      `[Email] Attempting to send ${emailType} via Resend to ${options.to}`
    );

    // Try Resend first
    const resendResult = await sendWithResend(options);

    if (resendResult.success) {
      return { ...resendResult, service: "resend" };
    }

    // Check if it's a rate limit error (100 emails/day exceeded)
    const isRateLimit =
      resendResult.error?.includes("rate limit") ||
      resendResult.error?.includes("quota") ||
      resendResult.error?.includes("daily limit");

    if (isRateLimit) {
      console.log(
        `[Email] Resend rate limit reached, falling back to SMTP for ${emailType}`
      );
      const smtpResult = await sendWithSMTP(options);
      return {
        ...smtpResult,
        service: smtpResult.success ? "smtp-fallback" : "failed",
        error: smtpResult.success
          ? undefined
          : `Resend failed (rate limit), SMTP also failed: ${smtpResult.error}`,
      };
    }

    // For other Resend errors, also try SMTP fallback
    console.log(
      `[Email] Resend failed with error: ${resendResult.error}, attempting SMTP fallback`
    );
    const smtpResult = await sendWithSMTP(options);
    return {
      ...smtpResult,
      service: smtpResult.success ? "smtp-fallback" : "failed",
      error: smtpResult.success
        ? undefined
        : `Both Resend and SMTP failed. Resend: ${resendResult.error}, SMTP: ${smtpResult.error}`,
    };
  } else {
    // Use SMTP directly for adminNotification or when emailType is not specified
    console.log(
      `[Email] Sending ${emailType || "unspecified"} via SMTP to ${options.to}`
    );
    const smtpResult = await sendWithSMTP(options);
    return { ...smtpResult, service: "smtp" };
  }
}

// Email templates - Simplified for better deliverability
export const emailTemplates = {
  // Welcome email for general users
  welcomeGeneral: (fullName: string) => ({
    subject: "Welcome to Waiveer",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Waiveer</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1>Welcome to Waiveer</h1>
          
          <p>Hello ${fullName},</p>
          
          <p>Thank you for joining Waiveer. Your account has been created successfully and you can now access our platform.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Browse and connect with experts</li>
            <li>Start conversations with professionals</li>
            <li>Access personalized recommendations</li>
          </ul>
          
          <p>To get started, visit: <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "https://waiveer.com"
          }/discover">Browse Experts</a></p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>
          The Waiveer Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Waiveer - Professional Expert Platform<br>
            This email was sent to confirm your account registration.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  // Expert application pending email
  expertApplicationPending: (fullName: string) => ({
    subject: "Expert Application Received",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Expert Application Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1>Expert Application Received</h1>
          
          <p>Hello ${fullName},</p>
          
          <p>We have received your expert application and it is currently under review.</p>
          
          <p><strong>Application Status:</strong> Under Review<br>
          <strong>Review Timeline:</strong> Up to 48 hours</p>
          
          <p>Our team will review your qualifications and experience. The review process includes:</p>
          <ol>
            <li>Verification of your credentials and experience</li>
            <li>Review of your expertise areas</li>
            <li>Final decision within 48 hours</li>
          </ol>
          
          <p>You will receive an email notification with our decision. Meanwhile, you can continue using Waiveer as a regular user.</p>
          
          <p>If you have any questions about your application, please contact us.</p>
          
          <p>Best regards,<br>
          The Waiveer Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Waiveer - Professional Expert Platform<br>
            This email was sent regarding your expert application.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  // Admin notification for new expert application
  adminNotification: (fullName: string, userEmail: string, userId: string) => ({
    subject: `New Expert Application: ${fullName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Expert Application</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1>New Expert Application</h1>
          
          <p>A new expert application has been submitted and requires review.</p>
          
          <p><strong>Applicant Details:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${fullName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>User ID:</strong> ${userId}</li>
            <li><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          
          <p>Please review this application in the admin panel within 48 hours.</p>
          
          <p>Review Application: <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "https://waiveer.com"
          }/admin/expert-applications">Admin Panel</a></p>
          
          <p>Waiveer System</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This is an automated notification for new expert applications.
          </p>
        </div>
      </body>
      </html>
    `,
  }),
};

// Helper functions for sending specific email types with correct service routing
export async function sendWelcomeEmail(to: string, fullName: string) {
  const template = emailTemplates.welcomeGeneral(fullName);
  return await sendEmail({ to, ...template }, "welcomeGeneral");
}

export async function sendExpertApplicationEmail(to: string, fullName: string) {
  const template = emailTemplates.expertApplicationPending(fullName);
  return await sendEmail({ to, ...template }, "expertApplicationPending");
}

export async function sendAdminNotificationEmail(
  to: string,
  fullName: string,
  userEmail: string,
  userId: string
) {
  const template = emailTemplates.adminNotification(
    fullName,
    userEmail,
    userId
  );
  return await sendEmail({ to, ...template }, "adminNotification");
}
