import { prisma } from "@/lib/prisma";
import { Prisma, PrismaClient } from "@prisma/client";

type PrismaModels = {
  [K in Prisma.ModelName]: PrismaClient[Lowercase<K>];
};

export class BaseService {
  protected prisma = prisma;

  protected async findUnique<T extends Prisma.ModelName>(
    model: T,
    where: Prisma.Args<PrismaModels[T]>["findUnique"]["where"]
  ) {
    return (this.prisma[model.toLowerCase()] as PrismaModels[T]).findUnique({ where });
  }

  protected async findMany<T extends Prisma.ModelName>(
    model: T,
    args?: Prisma.Args<PrismaModels[T]>["findMany"]
  ) {
    return (this.prisma[model.toLowerCase()] as PrismaModels[T]).findMany(args);
  }

  protected async create<T extends Prisma.ModelName>(
    model: T,
    data: Prisma.Args<PrismaModels[T]>["create"]["data"]
  ) {
    return (this.prisma[model.toLowerCase()] as PrismaModels[T]).create({ data });
  }

  protected async update<T extends Prisma.ModelName>(
    model: T,
    where: Prisma.Args<PrismaModels[T]>["update"]["where"],
    data: Prisma.Args<PrismaModels[T]>["update"]["data"]
  ) {
    return (this.prisma[model.toLowerCase()] as PrismaModels[T]).update({ where, data });
  }

  protected async delete<T extends Prisma.ModelName>(
    model: T,
    where: Prisma.Args<PrismaModels[T]>["delete"]["where"]
  ) {
    return (this.prisma[model.toLowerCase()] as PrismaModels[T]).delete({ where });
  }

  protected async upsert<T extends Prisma.ModelName>(
    model: T,
    where: Prisma.Args<PrismaModels[T]>["upsert"]["where"],
    create: Prisma.Args<PrismaModels[T]>["upsert"]["create"],
    update: Prisma.Args<PrismaModels[T]>["upsert"]["update"]
  ) {
    return (this.prisma[model.toLowerCase()] as PrismaModels[T]).upsert({
      where,
      create,
      update,
    });
  }
} 