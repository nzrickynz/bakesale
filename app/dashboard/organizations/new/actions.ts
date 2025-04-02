"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createOrganization(formData: FormData, userId: string) {
  console.log("[CREATE_ORG] Starting organization creation with userId:", userId);
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const websiteUrl = formData.get("websiteUrl") as string;
  const facebookUrl = formData.get("facebookUrl") as string;
  const instagramUrl = formData.get("instagramUrl") as string;

  try {
    // First verify that the user exists
    console.log("[CREATE_ORG] Looking up user with ID:", userId);
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    console.log("[CREATE_ORG] User lookup result:", user ? "Found" : "Not found");
    if (user) {
      console.log("[CREATE_ORG] User details:", {
        id: user.id,
        email: user.email,
        role: user.role
      });
    }

    if (!user) {
      console.log("[CREATE_ORG] User not found in database");
      return { 
        success: false, 
        error: "User not found. Please make sure you are logged in." 
      };
    }

    // Create the organization
    console.log("[CREATE_ORG] Creating organization with name:", name);
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

    console.log("[CREATE_ORG] Organization created successfully:", organization.id);

    // Create the user-organization relationship
    console.log("[CREATE_ORG] Creating user-organization relationship");
    await prisma.userOrganization.create({
      data: {
        userId,
        organizationId: organization.id,
        role: "ORG_ADMIN",
      },
    });

    console.log("[CREATE_ORG] User-organization relationship created successfully");
    revalidatePath("/dashboard/organizations");
    return { success: true, organizationId: organization.id };
  } catch (error) {
    console.error("[CREATE_ORG] Error creating organization:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log("[CREATE_ORG] Prisma error code:", error.code);
      console.log("[CREATE_ORG] Prisma error meta:", error.meta);
      if (error.code === 'P2025') {
        return { 
          success: false, 
          error: "Failed to create organization: User not found. Please make sure you are logged in." 
        };
      }
    }
    return { 
      success: false, 
      error: "Failed to create organization. Please try again." 
    };
  }
} 