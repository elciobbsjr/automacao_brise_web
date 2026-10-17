import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "@/auth";

import {
  prisma,
} from "@/lib/prisma";

import type {
  UserRole,
} from "@/generated/prisma/client";

export interface AuthenticatedApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface ApiAuthSuccess {
  ok: true;
  user: AuthenticatedApiUser;
}

interface ApiAuthFailure {
  ok: false;
  response: NextResponse;
}

export type ApiAuthResult =
  | ApiAuthSuccess
  | ApiAuthFailure;

/*
 * Confirma:
 *
 * 1. se existe uma sessão;
 * 2. se existe um ID de usuário;
 * 3. se o usuário ainda existe no banco;
 * 4. se a conta continua ativa.
 *
 * Assim não dependemos apenas do JWT.
 */
export async function requireApiAuth():
  Promise<ApiAuthResult> {
  try {
    const session =
      await auth();

    const userId =
      session?.user?.id;

    if (!userId) {
      return {
        ok: false,

        response:
          NextResponse.json(
            {
              error:
                "Autenticação necessária.",
            },
            {
              status: 401,
            },
          ),
      };
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
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
      return {
        ok: false,

        response:
          NextResponse.json(
            {
              error:
                "Sessão inválida ou usuário desativado.",
            },
            {
              status: 401,
            },
          ),
      };
    }

    return {
      ok: true,

      user: {
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
  } catch (error) {
    console.error(
      "Erro ao validar autenticação da API:",
      error,
    );

    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "Não foi possível validar a autenticação.",
          },
          {
            status: 500,
          },
        ),
    };
  }
}