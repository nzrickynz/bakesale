"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrganization(formData: FormData, userId: string) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const websiteUrl = formData.get("websiteUrl") as string;
  const facebookUrl = formData.get("facebookUrl") as string;
  const instagramUrl = formData.get("instagramUrl") as string;
  const adminEmail = formData.get("adminEmail") as string;

  try {
    // Create the organization
    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        websiteUrl,
        facebookUrl,
        instagramUrl,
        admin: {
          connect: { id: userId }
        }
      },
    });

    // Create the user-organization relationship
    await prisma.userOrganization.create({
      data: {
        userId,
        organizationId: organization.id,
        role: "ORG_ADMIN",
      },
    });

    revalidatePath("/dashboard/organizations");
    return { success: true, organizationId: organization.id };
  } catch (error) {
    console.error("Failed to create organization:", error);
    return { success: false, error: "Failed to create organization" };
  }
} 