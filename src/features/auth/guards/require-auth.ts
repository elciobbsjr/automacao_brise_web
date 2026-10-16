import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "@/auth";

/**
 * Garante que a página atual só possa
 * ser acessada por usuários autenticados.
 *
 * Caso não exista uma sessão válida,
 * o usuário é enviado para /login.
 */
export async function requireAuth() {
  const session =
    await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}