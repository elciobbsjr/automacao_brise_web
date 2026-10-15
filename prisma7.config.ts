import {
  config,
} from "dotenv";

import {
  defineConfig,
} from "prisma/config";

/*
 * A Vercel/Neon salvou as variáveis
 * locais em .env.local.
 *
 * O dotenv, por padrão, procura .env.
 * Por isso carregamos explicitamente
 * o .env.local.
 */
config({
  path: ".env.local",
});

/*
 * Para migrations e comandos da CLI
 * utilizamos a conexão direta do Neon.
 *
 * A aplicação Next.js usará
 * DATABASE_URL posteriormente.
 */
const directDatabaseUrl =
  process.env
    .DATABASE_URL_UNPOOLED;

if (!directDatabaseUrl) {
  throw new Error(
    "DATABASE_URL_UNPOOLED não foi encontrada no .env.local.",
  );
}

export default defineConfig({
  schema:
    "prisma/schema.prisma",

  migrations: {
    path:
      "prisma/migrations",
  },

  datasource: {
    url:
      directDatabaseUrl,
  },
});