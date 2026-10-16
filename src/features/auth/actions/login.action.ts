"use server";

import {
  AuthError,
} from "next-auth";

import {
  signIn,
} from "@/auth";

import {
  loginSchema,
} from "@/features/auth/schemas/login.schema";

export interface LoginActionState {
  error:
    | string
    | null;

  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

export async function loginAction(
  previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  /*
   * previousState faz parte da
   * assinatura exigida pelo
   * useActionState.
   */
  void previousState;

  const rawData = {
    email:
      formData.get(
        "email",
      ),

    password:
      formData.get(
        "password",
      ),
  };

  const parsed =
    loginSchema.safeParse(
      rawData,
    );

  if (!parsed.success) {
    const flattened =
      parsed.error.flatten();

    return {
      error:
        "Verifique os dados informados.",

      fieldErrors: {
        email:
          flattened
            .fieldErrors
            .email?.[0],

        password:
          flattened
            .fieldErrors
            .password?.[0],
      },
    };
  }

  try {
    await signIn(
      "credentials",
      {
        email:
          parsed.data.email,

        password:
          parsed.data.password,

        redirectTo:
          "/",
      },
    );

    return {
      error: null,
    };
  } catch (error) {
    /*
     * Erros de autenticação são
     * mostrados de maneira genérica.
     *
     * Não revelamos se o e-mail
     * existe no sistema.
     */
    if (
      error instanceof
      AuthError
    ) {
      switch (
        error.type
      ) {
        case "CredentialsSignin":
          return {
            error:
              "E-mail ou senha inválidos.",
          };

        default:
          return {
            error:
              "Não foi possível entrar no sistema. Tente novamente.",
          };
      }
    }

    /*
     * Redirects internos do Next.js
     * precisam continuar sendo lançados.
     */
    throw error;
  }
}