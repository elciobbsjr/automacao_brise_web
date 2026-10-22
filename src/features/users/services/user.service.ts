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

/* ==========================================
   ALTERAÇÃO DE STATUS
   ========================================== */

export async function getUserForStatusChange(
  userId: string,
) {
  return prisma.user.findUnique({
    where: {
      id:
        userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
  });
}

export async function countActiveAdmins() {
  return prisma.user.count({
    where: {
      role:
        "ADMIN",

      active:
        true,
    },
  });
}

export async function setUserActive(
  userId: string,
  active: boolean,
) {
  return prisma.user.update({
    where: {
      id:
        userId,
    },

    data: {
      active,
    },

    select: {
      id: true,
      active: true,
    },
  });
}