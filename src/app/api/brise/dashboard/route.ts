import {
  NextResponse,
} from "next/server";

import {
  requireApiRole,
} from "@/features/auth/guards/require-api-role";

import {
  BRISE_READ_ROLES,
} from "@/features/auth/permissions/roles";

import {
  getDashboard,
} from "@/services/brise.service";

export async function GET() {
  const permission =
    await requireApiRole(
      BRISE_READ_ROLES,
    );

  if (!permission.ok) {
    return permission.response;
  }

  try {
    const dashboard =
      await getDashboard();

    return NextResponse.json(
      dashboard,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao carregar o painel.";

    console.error(
      "Erro na rota do dashboard:",
      error,
    );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}