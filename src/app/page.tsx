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
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
        <AutoRefresh />

        {/* ==========================================
            ELEMENTOS DECORATIVOS DO FUNDO
            ========================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Luz azul superior */}
          <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-blue-200/30 blur-3xl" />

          {/* Luz azul lateral */}
          <div className="absolute -right-40 top-[320px] h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-3xl" />

          {/* Luz inferior */}
          <div className="absolute bottom-[-220px] left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-100/35 blur-3xl" />

          {/* Gradiente suave superior */}
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/65 to-transparent" />
        </div>

        {/* ==========================================
            CONTEÚDO PRINCIPAL
            ========================================== */}

        <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
          <DashboardHeader
            devices={
              dashboard.devices
            }
          />

          <div className="mt-8">
            <DashboardContent
              dashboard={
                dashboard
              }
            />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error(
      "Erro ao carregar dashboard:",
      error,
    );

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        {/* Fundo decorativo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-blue-200/30 blur-3xl" />

          <div className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-sky-200/25 blur-3xl" />
        </div>

        {/* Card de erro */}
        <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-7 w-7 text-amber-600"
            >
              <path d="M12 9v4" />

              <path d="M12 17h.01" />

              <path d="M10.3 3.6 2.4 17.3A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.7L13.7 3.6a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Brise · SEMEQ
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Não foi possível atualizar o painel
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            A comunicação com os
            dispositivos está
            temporariamente
            indisponível. Tente
            novamente em alguns
            instantes.
          </p>

          <a
            href="/"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" />

              <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" />
            </svg>

            Tentar novamente
          </a>
        </div>
      </main>
    );
  }
}