import {
  NextResponse,
} from "next/server";

import type {
  UserRole,
} from "@/generated/prisma/client";

import {
  requireApiAuth,
  type AuthenticatedApiUser,
} from "@/features/auth/guards/require-api-auth";

interface ApiRoleSuccess {
  ok: true;
  user: AuthenticatedApiUser;
}

interface ApiRoleFailure {
  ok: false;
  response: NextResponse;
}

export type ApiRoleResult =
  | ApiRoleSuccess
  | ApiRoleFailure;

export async function requireApiRole(
  allowedRoles:
    readonly UserRole[],
): Promise<ApiRoleResult> {
  const authentication =
    await requireApiAuth();

  if (!authentication.ok) {
    return authentication;
  }

  if (
    !allowedRoles.includes(
      authentication.user.role,
    )
  ) {
    return {
      ok: false,

      response:
        NextResponse.json(
          {
            error:
              "Você não possui permissão para realizar esta operação.",
          },
          {
            status: 403,
          },
        ),
    };
  }

  return {
    ok: true,
    user:
      authentication.user,
  };
}