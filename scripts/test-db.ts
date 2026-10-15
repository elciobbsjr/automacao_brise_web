import {
  config,
} from "dotenv";

import {
  PrismaPg,
} from "@prisma/adapter-pg";

import {
  PrismaClient,
} from "../src/generated/prisma/client";

/*
 * Carrega as variáveis locais
 * do branch dev-elcio.
 */
config({
  path: ".env.local",
});

async function main() {
  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não foi encontrada no .env.local.",
    );
  }

  /*
   * Usa a conexão pooled do Neon,
   * da mesma forma que a aplicação
   * utilizará em runtime.
   */
  const adapter =
    new PrismaPg({
      connectionString,
    });

  const prisma =
    new PrismaClient({
      adapter,
    });

  try {
    const userCount =
      await prisma.user.count();

    console.log(
      "Conexão com o banco realizada com sucesso.",
    );

    console.log(
      `Usuários cadastrados: ${userCount}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "Falha ao testar a conexão com o banco:",
  );

  console.error(error);

  process.exit(1);
});