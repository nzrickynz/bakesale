import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvitationEmailParams {
  email: string;
  tempPassword: string;
}

export async function sendInvitationEmail({ email, tempPassword }: InvitationEmailParams) {
  try {
    await resend.emails.send({
      from: "BakeSale <noreply@bakesale.com>",
      to: email,
      subject: "Welcome to BakeSale - Your Volunteer Account",
      html: `
        <h1>Welcome to BakeSale!</h1>
        <p>You've been invited to join BakeSale as a volunteer. Here are your login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please change your password after logging in for the first time.</p>
        <p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">here</a> to log in.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw error;
  }
} 