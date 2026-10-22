import "server-only";

import {
  prisma,
} from "@/lib/prisma";

import type {
  UserRole,
} from "@/generated/prisma/client";

interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },

    orderBy: [
      {
        active:
          "desc",
      },
      {
        name:
          "asc",
      },
    ],
  });
}

export async function findUserByEmail(
  email: string,
) {
  return prisma.user.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
    },
  });
}

export async function createUser(
  data: CreateUserData,
) {
  return prisma.user.create({
    data: {
      name:
        data.name,

      email:
        data.email,

      passwordHash:
        data.passwordHash,

      role:
        data.role,

      active:
        true,
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
}