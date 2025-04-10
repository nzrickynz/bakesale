import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { addHours } from "date-fns";

type PasswordResetWithUser = Prisma.PasswordResetGetPayload<{
  include: {
    user: true;
  };
}>;

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export class PasswordResetService {
  async findUnique(params: {
    where: Prisma.PasswordResetWhereUniqueInput;
    include?: Prisma.PasswordResetInclude;
  }): Promise<PasswordResetWithUser | null> {
    return prisma.passwordReset.findUnique({
      ...params,
      include: {
        ...params.include,
        user: true,
      },
    });
  }

  async create(userId: string) {
    return prisma.passwordReset.create({
      data: {
        userId,
        token: randomBytes(32).toString("hex"),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      include: {
        user: true
      }
    });
  }

  async delete(where: Prisma.PasswordResetWhereUniqueInput) {
    return prisma.passwordReset.delete({ where });
  }

  async requestReset(email: string): Promise<PasswordResetWithUser | null> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return null if user not found for security
      return null;
    }

    // Generate reset token
    const token = randomBytes(32).toString("hex");
    const expires = addHours(new Date(), 24);

    // Save reset token
    return this.create(user.id);
  }

  async findValidToken(token: string) {
    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!reset) {
      return null;
    }

    if (reset.expires < new Date()) {
      await this.deleteToken(token);
      return null;
    }

    return reset;
  }

  async resetPassword(token: string, newPassword: string) {
    // Validate password
    const validationResult = passwordSchema.safeParse(newPassword);
    if (!validationResult.success) {
      throw new Error(validationResult.error.errors[0].message);
    }

    const reset = await this.findValidToken(token);
    if (!reset) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash the new password
    const passwordHash = await hash(newPassword, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: reset.userId },
      data: {
        passwordHash,
      },
    });

    // Delete the used reset token
    await this.deleteToken(token);

    return reset.user;
  }

  async deleteExpiredTokens() {
    return prisma.passwordReset.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
  }

  async deleteToken(token: string) {
    return prisma.passwordReset.delete({
      where: { token },
    });
  }
} 