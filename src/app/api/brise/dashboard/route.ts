import { NextResponse } from "next/server";

import { getDashboard } from "@/services/brise.service";

export async function GET() {
  try {
    const dashboard = await getDashboard();

    return NextResponse.json(dashboard);
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