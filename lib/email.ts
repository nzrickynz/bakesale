import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvitationEmailParams {
  to: string;
  organizationName: string;
  invitationToken: string;
}

interface TempPasswordEmailParams {
  email: string;
  tempPassword: string;
}

export async function sendInvitationEmail({
  to,
  organizationName,
  invitationToken,
}: InvitationEmailParams) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${invitationToken}`;

  await resend.emails.send({
    from: 'Bake Sale <noreply@bakesale.co.nz>',
    to,
    subject: `You've been invited to join ${organizationName} on Bake Sale`,
    html: `
      <h1>You've been invited to join ${organizationName}</h1>
      <p>You've been invited to join ${organizationName} on Bake Sale. Click the link below to accept the invitation:</p>
      <p><a href="${acceptUrl}">Accept Invitation</a></p>
      <p>This invitation will expire in 7 days.</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    `,
  });
}

export async function sendTempPasswordEmail({
  email,
  tempPassword,
}: TempPasswordEmailParams) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;

  await resend.emails.send({
    from: 'Bake Sale <noreply@bakesale.co.nz>',
    to: email,
    subject: "Welcome to Bake Sale - Your Temporary Password",
    html: `
      <h1>Welcome to Bake Sale!</h1>
      <p>You've been added as a volunteer. Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please change your password after logging in.</p>
      <p><a href="${loginUrl}">Click here to log in</a></p>
      <p>If you didn't expect this email, you can safely ignore it.</p>
    `,
  });
} 