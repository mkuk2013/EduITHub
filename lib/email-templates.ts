/**
 * Transactional email templates for Edu IT Hub Academy.
 *
 * Pure functions: (vars) => { subject, html }. Responsive HTML with inline
 * CSS only — no external assets. Pass academyName from the `academy.name`
 * Setting so branding always matches the admin-managed value.
 */

import { formatPKR } from "./format";

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

interface LayoutOptions {
  academyName: string;
  title: string;
  body: string;
}

function layout({ academyName, title, body }: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#4338ca;padding:28px 32px;">
              <p style="margin:0;color:#fbbf24;font-size:13px;font-weight:bold;letter-spacing:2px;">EDU IT HUB ACADEMY</p>
              <h1 style="margin:8px 0 0 0;color:#ffffff;font-size:22px;line-height:1.3;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;color:#334155;font-size:15px;line-height:1.7;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#020617;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                ${academyName} &bull; Practical IT skills, taught live.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0 0;color:#94a3b8;font-size:11px;">
          This is an automated message from ${academyName}. Please do not reply directly to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:14px;width:40%;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:bold;vertical-align:top;">${value}</td>
  </tr>`;
}

function detailTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background-color:#f8fafc;border-radius:8px;padding:4px 16px;">${rows}</table>`;
}

/* ------------------------------------------------------------------ */
/* Template types                                                      */
/* ------------------------------------------------------------------ */

export interface TemplateResult {
  subject: string;
  html: string;
}

interface BaseVars {
  academyName: string;
  studentName: string;
}

interface PaymentVars extends BaseVars {
  courseTitle: string;
  amount: number;
  month: string;
}

/* ------------------------------------------------------------------ */
/* Registration & account                                              */
/* ------------------------------------------------------------------ */

export function registrationReceived(vars: BaseVars): TemplateResult {
  const { academyName, studentName } = vars;
  return {
    subject: `Registration received — ${academyName}`,
    html: layout({
      academyName,
      title: "Registration received",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p>Thank you for registering with ${academyName}. Your account request has been received and is now waiting for approval by our administration team.</p>
        <p>You will receive another email as soon as your account is reviewed. There is nothing more you need to do right now.</p>
        <p style="color:#64748b;font-size:14px;">We look forward to welcoming you to your first class.</p>`,
    }),
  };
}

export function accountApproved(vars: BaseVars): TemplateResult {
  const { academyName, studentName } = vars;
  return {
    subject: `Your account is approved — welcome to ${academyName}`,
    html: layout({
      academyName,
      title: "Account approved",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p>Good news — your ${academyName} account has been approved. You can now sign in, explore the course catalog, and enroll in the courses of your choice.</p>
        <p>After enrolling, submit your first month's fee and our team will verify your payment to activate your classes.</p>`,
    }),
  };
}

export function accountRejected(vars: BaseVars & { reason?: string }): TemplateResult {
  const { academyName, studentName, reason } = vars;
  return {
    subject: `Update on your ${academyName} registration`,
    html: layout({
      academyName,
      title: "Registration update",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p>After review, we are unable to approve your ${academyName} account at this time.</p>
        ${reason ? `<p style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;font-size:14px;"><strong>Reason:</strong> ${reason}</p>` : ""}
        <p style="color:#64748b;font-size:14px;">If you believe this is a mistake, please contact our support team and we will be happy to review your case again.</p>`,
    }),
  };
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export function paymentSubmitted(vars: PaymentVars & { transactionId: string }): TemplateResult {
  const { academyName, studentName, courseTitle, amount, month, transactionId } = vars;
  return {
    subject: `Payment submitted for verification — ${courseTitle} (${month})`,
    html: layout({
      academyName,
      title: "Payment submitted",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p>We have received your fee payment. Our administration team will verify it shortly — you will be notified as soon as it is reviewed.</p>
        ${detailTable(
          detailRow("Course", courseTitle) +
            detailRow("Amount", formatPKR(amount)) +
            detailRow("Billing month", month) +
            detailRow("Transaction ID", transactionId),
        )}`,
    }),
  };
}

export function paymentApproved(
  vars: PaymentVars & { validUntil: string },
): TemplateResult {
  const { academyName, studentName, courseTitle, amount, month, validUntil } = vars;
  return {
    subject: `Payment approved — ${courseTitle} (${month})`,
    html: layout({
      academyName,
      title: "Payment approved",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;font-size:14px;">Your payment has been <strong>approved</strong>. Your enrollment is now active — you can join your live classes right away.</p>
        ${detailTable(
          detailRow("Course", courseTitle) +
            detailRow("Amount", formatPKR(amount)) +
            detailRow("Billing month", month) +
            detailRow("Valid until", validUntil),
        )}`,
    }),
  };
}

export function paymentRejected(
  vars: PaymentVars & { adminNote?: string },
): TemplateResult {
  const { academyName, studentName, courseTitle, amount, month, adminNote } = vars;
  return {
    subject: `Payment not approved — ${courseTitle} (${month})`,
    html: layout({
      academyName,
      title: "Payment not approved",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p>Unfortunately, we could not approve your recent fee payment for <strong>${courseTitle}</strong> (${month}, ${formatPKR(amount)}).</p>
        ${adminNote ? `<p style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;font-size:14px;"><strong>Note from admin:</strong> ${adminNote}</p>` : ""}
        <p>Please review the details and submit a new payment from your dashboard. If you think this was an error, contact our support team.</p>`,
    }),
  };
}

export function paymentCorrectionRequested(
  vars: PaymentVars & { adminNote?: string },
): TemplateResult {
  const { academyName, studentName, courseTitle, amount, month, adminNote } = vars;
  return {
    subject: `Action needed on your payment — ${courseTitle} (${month})`,
    html: layout({
      academyName,
      title: "Correction requested",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p>Your fee payment for <strong>${courseTitle}</strong> (${month}, ${formatPKR(amount)}) needs a small correction before we can approve it.</p>
        ${adminNote ? `<p style="background-color:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;font-size:14px;"><strong>What to fix:</strong> ${adminNote}</p>` : ""}
        <p>Please submit a corrected payment from your dashboard at your earliest convenience.</p>`,
    }),
  };
}

export function feeReminder(
  vars: PaymentVars & { dueNote?: string },
): TemplateResult {
  const { academyName, studentName, courseTitle, amount, month, dueNote } = vars;
  return {
    subject: `Fee reminder — ${courseTitle} (${month})`,
    html: layout({
      academyName,
      title: "Fee reminder",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p>This is a friendly reminder that your monthly fee for <strong>${courseTitle}</strong> is due.</p>
        ${detailTable(detailRow("Amount due", formatPKR(amount)) + detailRow("Billing month", month))}
        ${dueNote ? `<p style="color:#64748b;font-size:14px;">${dueNote}</p>` : ""}
        <p>Please submit your payment from your dashboard to keep your classes uninterrupted.</p>`,
    }),
  };
}

export function enrollmentActivated(
  vars: BaseVars & { courseTitle: string; validUntil: string },
): TemplateResult {
  const { academyName, studentName, courseTitle, validUntil } = vars;
  return {
    subject: `Your enrollment is active — ${courseTitle}`,
    html: layout({
      academyName,
      title: "Enrollment activated",
      body: `<p>Dear <strong>${studentName}</strong>,</p>
        <p>Your enrollment in <strong>${courseTitle}</strong> is now <strong>active</strong>. You can join live classes from your dashboard.</p>
        ${detailTable(detailRow("Course", courseTitle) + detailRow("Valid until", validUntil))}`,
    }),
  };
}
