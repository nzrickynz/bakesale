// Server Component (NO "use client")
import { notFound } from "next/navigation";
import { requireOrganizationAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import NewCauseForm from "./NewCauseForm";

interface PageProps {
  params: { id: string };
}

export default async function NewCausePage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);

  if (userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
  });

  if (!organization) {
    notFound();
  }

  return <NewCauseForm organizationId={params.id} />;
} 