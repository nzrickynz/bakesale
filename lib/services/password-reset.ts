import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { z } from "zod";

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

  async create(params: {
    data: Prisma.PasswordResetCreateInput;
    include?: Prisma.PasswordResetInclude;
  }): Promise<PasswordResetWithUser> {
    return prisma.passwordReset.create({
      ...params,
      include: {
        ...params.include,
        user: true,
      },
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
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    return this.create({
      data: {
        user: {
          connect: { id: user.id }
        },
        token,
        expires,
      },
      include: {
        user: true,
      },
    });
  }

  async verifyToken(token: string): Promise<PasswordResetWithUser | null> {
    const reset = await this.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    if (!reset) {
      return null;
    }

    // Check if token has expired
    if (reset.expires < new Date()) {
      await this.delete({ token });
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

    const reset = await this.verifyToken(token);
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
    await this.delete({ token });

    return reset.user;
  }

  async cleanupExpiredTokens() {
    const now = new Date();
    const expiredTokens = await prisma.passwordReset.findMany({
      where: {
        expires: {
          lt: now,
        },
      },
    });

    // Delete all expired tokens
    await Promise.all(
      expiredTokens.map((token) =>
        this.delete({ token: token.token })
      )
    );

    return expiredTokens.length;
  }
} 