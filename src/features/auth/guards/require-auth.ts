import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "@/auth";

import {
  prisma,
} from "@/lib/prisma";

/**
 * Garante que a página atual só possa
 * ser acessada por usuários autenticados
 * e cuja conta continue ativa no banco.
 *
 * Também retorna os dados atuais
 * do usuário diretamente do banco.
 */
export async function requireAuth() {
  const session =
    await auth();

  const userId =
    session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const user =
    await prisma.user.findUnique({
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

  /*
   * Não podemos executar signOut()
   * diretamente durante a renderização
   * de um Server Component.
   *
   * Redirecionamos para um Route Handler,
   * que possui permissão para alterar
   * os cookies da sessão.
   */
  if (
    !user ||
    !user.active
  ) {
    redirect(
      "/api/session/force-sign-out",
    );
  }

  /*
   * Mantemos o mesmo formato esperado
   * pelo restante da aplicação.
   *
   * Nome, e-mail e perfil vêm do banco,
   * portanto alterações administrativas
   * são refletidas imediatamente.
   */
  return {
    ...session,

    user: {
      ...session.user,

      id:
        user.id,

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,
    },
  };
}