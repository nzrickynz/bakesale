import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class BaseService<T extends keyof PrismaClient> {
  protected model: PrismaClient[T];

  constructor(modelName: T) {
    this.model = prisma[modelName];
  }

  async findUnique(args: any) {
    return (this.model as any).findUnique(args);
  }

  async findMany(args?: any) {
    return (this.model as any).findMany(args);
  }

  async create(args: any) {
    return (this.model as any).create(args);
  }

  async update(args: any) {
    return (this.model as any).update(args);
  }

  async delete(args: any) {
    return (this.model as any).delete(args);
  }

  async upsert(args: any) {
    return (this.model as any).upsert(args);
  }
} 