import {
  AutoRefresh,
} from "@/components/dashboard/AutoRefresh";

import {
  DashboardHeader,
} from "@/components/dashboard/DashboardHeader";

import {
  DashboardContent,
} from "@/components/dashboard/DashboardContent";

import {
  getDashboard,
} from "@/services/brise.service";

export default async function Home() {
  try {
    const dashboard =
      await getDashboard();

    return (
      <main className="min-h-screen bg-slate-50">
        <AutoRefresh />

        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <DashboardHeader
            devices={
              dashboard.devices
            }
          />

          <DashboardContent
            dashboard={
              dashboard
            }
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error(
      "Erro ao carregar dashboard:",
      error,
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Não foi possível atualizar o painel
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            A comunicação com os
            dispositivos está
            temporariamente
            indisponível. Tente
            novamente em alguns
            instantes.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Tentar novamente
          </a>
        </div>
      </main>
    );
  }
}