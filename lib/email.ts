import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY environment variable is required");
}

const resend = new Resend(process.env.RESEND_API_KEY || 'ABC');

interface InvitationEmailParams {
  to: string;
  organizationName: string;
  token: string;
  role: string;
  invitedByName: string;
}

interface TempPasswordEmailParams {
  email: string;
  tempPassword: string;
}

export async function sendInvitationEmail({
  to,
  organizationName,
  token,
  role,
  invitedByName,
}: InvitationEmailParams) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/register/${token}`;

  await resend.emails.send({
    from: 'Bake Sale <noreply@bakesale.co.nz>',
    to,
    subject: `You've been invited to join ${organizationName} on Bake Sale`,
    html: `
      <h1>You've been invited to join ${organizationName}</h1>
      <p>${invitedByName} has invited you to join ${organizationName} on Bake Sale as a ${role.toLowerCase()}.</p>
      <p>Click the link below to create your account and get started:</p>
      <p><a href="${acceptUrl}">Create Account</a></p>
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

export async function sendVolunteerAssignmentEmail({
  to,
  listingTitle,
  causeTitle,
  organizationName,
}: {
  to: string;
  listingTitle: string;
  causeTitle: string;
  organizationName: string;
}) {
  await resend.emails.send({
    from: "Bakesale <noreply@bakesale.co.nz>",
    to,
    subject: "You've been assigned to a new listing",
    html: `
      <p>Hello,</p>
      <p>You've been assigned to manage a new listing on Bakesale:</p>
      <p><strong>Listing:</strong> ${listingTitle}</p>
      <p><strong>Cause:</strong> ${causeTitle}</p>
      <p><strong>Organization:</strong> ${organizationName}</p>
      <p>You can view and manage this listing in your volunteer dashboard.</p>
      <p>Thank you for your support!</p>
    `,
  });
}
