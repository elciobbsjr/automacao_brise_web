import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "@/auth";

import {
  prisma,
} from "@/lib/prisma";

import type {
  UserRole,
} from "@/generated/prisma/client";

export async function requireRole(
  allowedRoles:
    readonly UserRole[],
) {
  const session =
    await auth();

  /*
   * Sem sessão:
   * volta para o login.
   */
  if (
    !session?.user?.id
  ) {
    redirect("/login");
  }

  /*
   * Consultamos novamente o banco
   * para não depender apenas do JWT.
   *
   * Assim:
   *
   * - usuário desativado perde acesso;
   * - mudança de perfil é considerada;
   * - usuário removido perde acesso.
   */
  const user =
    await prisma.user.findUnique({
      where: {
        id:
          session.user.id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

  if (
    !user ||
    !user.active
  ) {
    redirect("/login");
  }

  /*
   * Usuário autenticado,
   * porém sem o perfil necessário.
   */
  if (
    !allowedRoles.includes(
      user.role,
    )
  ) {
    redirect("/");
  }

  return user;
}