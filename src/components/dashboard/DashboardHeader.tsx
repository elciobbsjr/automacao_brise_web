import Image from "next/image";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  ScheduleManager,
} from "@/components/schedule/ScheduleManager";

interface DashboardHeaderProps {
  devices: DashboardDevice[];
}

export function DashboardHeader({
  devices,
}: DashboardHeaderProps) {
  const total =
    devices.length;

  const onlineDevices =
    devices.filter(
      (device) =>
        device.online,
    ).length;

  const availability =
    total > 0
      ? Math.round(
          (onlineDevices /
            total) *
            100,
        )
      : 0;

  return (
    <header className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      {/* FUNDO */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-blue-50/80" />

        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -bottom-28 left-1/3 h-60 w-60 rounded-full bg-sky-100/40 blur-3xl" />

        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900 via-blue-700 to-sky-400" />
      </div>

      <div className="relative z-10 p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* =====================================
              CONTEÚDO PRINCIPAL
              ===================================== */}

          <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center">
            {/* LOGOS */}

            <div className="flex shrink-0 items-center">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                <div className="relative h-16 w-16 sm:h-[72px] sm:w-[72px]">
                  <Image
                    src="/tre-ma.png"
                    alt="TRE-MA"
                    fill
                    sizes="72px"
                    priority
                    className="object-contain"
                  />
                </div>

                <div className="h-12 w-px bg-slate-200 sm:h-14" />

                <div className="relative h-16 w-[180px] sm:h-[72px] sm:w-[215px]">
                  <Image
                    src="/semeq-completo.png"
                    alt="SEMEQ - Seção de Manutenção de Equipamentos"
                    fill
                    sizes="215px"
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="hidden h-20 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent lg:block" />

            {/* TÍTULO */}

            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />

                  Central de climatização
                </span>

                <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                  TRE-MA
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-[34px]">
                Brise{" "}
                <span className="font-medium text-slate-400">
                  /
                </span>{" "}
                <span className="text-blue-700">
                  SEMEQ
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Monitoramento e controle
                dos dispositivos de
                climatização do Tribunal
                Regional Eleitoral do
                Maranhão.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <HeaderInfo
                  icon={
                    <EquipmentIcon />
                  }
                >
                  {devices.length}{" "}
                  {devices.length === 1
                    ? "equipamento"
                    : "equipamentos"}
                </HeaderInfo>

                <HeaderInfo
                  icon={
                    <MonitoringIcon />
                  }
                >
                  Painel de monitoramento
                </HeaderInfo>
              </div>
            </div>
          </div>

          {/* =====================================
              COLUNA DIREITA
              ===================================== */}

          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto xl:w-[260px]">
            {/* GERENCIAMENTO */}

            <div className="rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
              <div className="mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Gerenciamento
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Programação dos
                  equipamentos
                </p>
              </div>

              <ScheduleManager
                devices={devices}
              />
            </div>

            {/* DISPONIBILIDADE */}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <AvailabilityIcon />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Disponibilidade
                </p>

                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    {availability}%
                  </span>

                  <span className="text-xs text-slate-500">
                    online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ==========================================
   INFORMAÇÕES AUXILIARES
   ========================================== */

function HeaderInfo({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </span>

      <span>{children}</span>
    </div>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function EquipmentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="13"
        rx="2"
      />

      <path d="M7 21h10" />
      <path d="M9 17v4" />
      <path d="M15 17v4" />
    </svg>
  );
}

function MonitoringIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}

function AvailabilityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 12a8 8 0 1 1 16 0" />

      <path d="M12 12 16 8" />

      <circle
        cx="12"
        cy="12"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}