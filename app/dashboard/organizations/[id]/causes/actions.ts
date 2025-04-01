"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCause(formData: FormData, organizationId: string) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const targetGoal = parseFloat(formData.get("goal") as string);
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);

  try {
    await prisma.cause.create({
      data: {
        title,
        description,
        targetGoal,
        startDate,
        endDate,
        status: "ACTIVE",
        organizationId,
      },
    });

    revalidatePath(`/dashboard/organizations/${organizationId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create cause:", error);
    return { success: false, error: "Failed to create cause" };
  }
} 