import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: {
    token: string;
  };
}

export default async function AcceptInvitationPage({
  searchParams,
}: PageProps) {
  const { token } = searchParams;

  if (!token) {
    notFound();
  }

  const invitation = await prisma.volunteerInvitation.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      organization: true,
    },
  });

  if (!invitation) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    // If user is not logged in, redirect to login page with return URL
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/invite/accept?token=${token}`)}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    notFound();
  }

  // Check if user is already a member of the organization
  const existingMember = await prisma.userOrganization.findFirst({
    where: {
      userId: user.id,
      organizationId: invitation.organizationId,
    },
  });

  if (existingMember) {
    toast.error("You are already a member of this organization");
    redirect(`/dashboard/organizations/${invitation.organizationId}`);
  }

  // Add user to organization
  await prisma.userOrganization.create({
    data: {
      userId: user.id,
      organizationId: invitation.organizationId,
      role: "VOLUNTEER",
    },
  });

  // Delete the invitation
  await prisma.volunteerInvitation.delete({
    where: { id: invitation.id },
  });

  toast.success(`You have been added to ${invitation.organization.name}`);
  redirect(`/dashboard/organizations/${invitation.organizationId}`);
} 