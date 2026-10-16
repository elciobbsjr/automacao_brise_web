import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "@/auth";

import {
  LoginScreen,
} from "@/features/auth/components/LoginScreen";

export default async function LoginPage() {
  const session =
    await auth();

  /*
   * Usuário autenticado não precisa
   * visualizar novamente a tela
   * de login.
   */
  if (session?.user) {
    redirect("/");
  }

  return (
    <LoginScreen />
  );
}