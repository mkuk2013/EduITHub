import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient across serverless invocations. Always import from here:
//   import { prisma } from "@/lib/prisma";
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

globalForPrisma.prisma = prisma;
