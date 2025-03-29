import nodemailer from "nodemailer";

if (!process.env.SMTP_HOST) {
  throw new Error("SMTP_HOST environment variable is required");
}

if (!process.env.SMTP_PORT) {
  throw new Error("SMTP_PORT environment variable is required");
}

if (!process.env.SMTP_USER) {
  throw new Error("SMTP_USER environment variable is required");
}

if (!process.env.SMTP_PASSWORD) {
  throw new Error("SMTP_PASSWORD environment variable is required");
}

if (!process.env.SMTP_FROM) {
  throw new Error("SMTP_FROM environment variable is required");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface InvitationEmailParams {
  to: string;
  organizationName: string;
  invitationToken: string;
}

export async function sendInvitationEmail({
  to,
  organizationName,
  invitationToken,
}: InvitationEmailParams) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${invitationToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: `You've been invited to join ${organizationName} on Bake Sale`,
    html: `
      <h1>You've been invited to join ${organizationName}</h1>
      <p>You've been invited to join ${organizationName} on Bake Sale. Click the link below to accept the invitation:</p>
      <p><a href="${acceptUrl}">Accept Invitation</a></p>
      <p>This invitation will expire in 7 days.</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
} 