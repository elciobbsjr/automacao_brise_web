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
    process.env.ADMIN_NAME
      ?.trim();

  const email =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.ADMIN_PASSWORD;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não foi encontrada.",
    );
  }

  if (!name) {
    throw new Error(
      "ADMIN_NAME não foi informado.",
    );
  }

  if (!email) {
    throw new Error(
      "ADMIN_EMAIL não foi informado.",
    );
  }

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD não foi informado.",
    );
  }

  if (
    password.length < 12
  ) {
    throw new Error(
      "ADMIN_PASSWORD deve possuir pelo menos 12 caracteres.",
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
    const existingAdmin =
      await prisma.user.findFirst({
        where: {
          role:
            UserRole.ADMIN,
          active: true,
        },
      });

    if (existingAdmin) {
      console.log(
        "Já existe um administrador ativo.",
      );

      console.log(
        `Administrador: ${existingAdmin.email}`,
      );

      return;
    }

    const existingEmail =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingEmail) {
      throw new Error(
        "Já existe um usuário cadastrado com esse e-mail.",
      );
    }

    const passwordHash =
      await hashPassword(
        password,
      );

    const admin =
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role:
            UserRole.ADMIN,
          active: true,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

    console.log(
      "Administrador criado com sucesso.",
    );

    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      active: admin.active,
      createdAt:
        admin.createdAt,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "Não foi possível criar o administrador.",
  );

  console.error(error);

  process.exit(1);
});