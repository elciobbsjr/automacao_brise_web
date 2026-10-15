import "server-only";

import {
  PrismaPg,
} from "@prisma/adapter-pg";

import {
  PrismaClient,
} from "@/generated/prisma/client";

/*
 * Durante o desenvolvimento, o Next.js
 * pode recarregar módulos várias vezes.
 *
 * Mantemos uma única instância do
 * PrismaClient para evitar a criação
 * desnecessária de vários pools de
 * conexão com o PostgreSQL.
 */
const globalForPrisma =
  globalThis as unknown as {
    prisma:
      | PrismaClient
      | undefined;
  };

function createPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não foi encontrada.",
    );
  }

  /*
   * Em runtime usamos DATABASE_URL,
   * que é a conexão pooled fornecida
   * pelo Neon.
   *
   * As migrations continuam usando
   * DATABASE_URL_UNPOOLED através do
   * prisma7.config.ts.
   */
  const adapter =
    new PrismaPg({
      connectionString,
    });

  return new PrismaClient({
    adapter,
  });
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForPrisma.prisma =
    prisma;
}