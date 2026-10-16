import {
  config,
} from "dotenv";

import {
  PrismaPg,
} from "@prisma/adapter-pg";

import {
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client";

import {
  hashPassword,
} from "../src/lib/password";

config({
  path: ".env.local",
});

async function main() {
  const connectionString =
    process.env.DATABASE_URL;

  const name =
    process.env.USER_NAME?.trim();

  const email =
    process.env.USER_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.USER_PASSWORD;

  const roleValue =
    process.env.USER_ROLE
      ?.trim()
      .toUpperCase();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não foi encontrada.",
    );
  }

  if (!name) {
    throw new Error(
      "USER_NAME não foi informado.",
    );
  }

  if (!email) {
    throw new Error(
      "USER_EMAIL não foi informado.",
    );
  }

  if (
    !password ||
    password.length < 12
  ) {
    throw new Error(
      "USER_PASSWORD deve possuir pelo menos 12 caracteres.",
    );
  }

  if (
    roleValue !==
      UserRole.VIEWER &&
    roleValue !==
      UserRole.OPERATOR &&
    roleValue !==
      UserRole.ADMIN
  ) {
    throw new Error(
      "USER_ROLE deve ser VIEWER, OPERATOR ou ADMIN.",
    );
  }

  const adapter =
    new PrismaPg({
      connectionString,
    });

  const prisma =
    new PrismaClient({
      adapter,
    });

  try {
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new Error(
        "Já existe um usuário cadastrado com esse e-mail.",
      );
    }

    const passwordHash =
      await hashPassword(
        password,
      );

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role:
            roleValue,
          active:
            true,
        },

        select: {
          id:
            true,

          name:
            true,

          email:
            true,

          role:
            true,

          active:
            true,

          createdAt:
            true,
        },
      });

    console.log(
      "Usuário criado com sucesso.",
    );

    console.log(user);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(
  (error) => {
    console.error(
      "Não foi possível criar o usuário.",
    );

    console.error(
      error instanceof Error
        ? error.message
        : error,
    );

    process.exit(1);
  },
);