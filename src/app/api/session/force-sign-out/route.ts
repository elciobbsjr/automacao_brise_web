import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  signOut,
} from "@/auth";

export async function GET(
  request: NextRequest,
) {
  /*
   * Aqui estamos dentro de um
   * Route Handler, portanto o
   * Auth.js pode invalidar o
   * cookie da sessão.
   */
  await signOut({
    redirect:
      false,
  });

  /*
   * Após apagar a sessão,
   * enviamos o usuário para
   * a página de login.
   */
  return NextResponse.redirect(
    new URL(
      "/login",
      request.url,
    ),
  );
}