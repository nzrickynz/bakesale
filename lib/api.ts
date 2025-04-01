import { NextResponse } from "next/server";
import { requireApiAuth, requireApiRole, requireApiOrganizationAccess } from "./auth";
import { UserRole } from "@prisma/client";
import prisma from "./prisma";

export async function withApiAuth(handler: Function) {
  try {
    await requireApiAuth();
    return handler();
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function withApiRole(role: UserRole, handler: Function) {
  try {
    await requireApiRole(role);
    return handler();
  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}

export async function withOrganizationAccess(organizationId: string, handler: Function) {
  try {
    await requireApiOrganizationAccess(organizationId);
    return handler();
  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}

export async function withListingAccess(listingId: string, handler: Function) {
  try {
    const user = await requireApiAuth();
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        cause: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: listing.cause.organizationId,
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (userOrg.role !== UserRole.ORG_ADMIN && listing.volunteerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return handler();
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
} 