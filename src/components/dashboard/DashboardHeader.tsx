import Image from "next/image";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  ScheduleManager,
} from "@/components/schedule/ScheduleManager";

import {
  NotificationCenter,
} from "@/components/dashboard/NotificationCenter";

import {
  UserMenu,
} from "@/components/user/UserMenu";

import type {
  UserRole,
} from "@/generated/prisma/client";

interface DashboardHeaderProps {
  devices: DashboardDevice[];

  canManageSchedules: boolean;

  userName: string;

  userRole: UserRole;
}

export function DashboardHeader({
  devices,
  canManageSchedules,
  userName,
  userRole,
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
    <header className="relative z-10 overflow-visible rounded-[24px] border border-white/90 bg-gradient-to-r from-white via-white to-blue-50/80 shadow-[0_10px_32px_rgba(15,23,42,0.06)]">
      <div className="relative flex flex-col gap-7 p-6 sm:p-8 xl:min-h-[210px] xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex shrink-0 items-center gap-4">
            <div className="relative h-16 w-16 sm:h-[72px] sm:w-[72px]">
              <Image src="/tre-ma.png" alt="TRE-MA" fill sizes="72px" priority className="object-contain" />
            </div>
            <div className="h-12 w-px bg-slate-200" aria-hidden="true" />
            <div className="relative h-16 w-[150px] sm:h-[72px] sm:w-[215px]">
              <Image src="/semeq-completo.png" alt="SEMEQ - Seção de Manutenção de Equipamentos" fill sizes="215px" priority className="object-contain" />
            </div>
          </div>

          <div className="hidden h-28 w-px shrink-0 bg-slate-200 lg:block" aria-hidden="true" />

          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-slate-500">
              Central de climatização
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[34px]">
              Brise <span className="font-medium text-slate-400">/</span>{" "}
              <span className="text-blue-700">SEMEQ</span>
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Monitoramento e controle de climatização do TRE-MA
            </p>
            <p className="mt-4 text-sm text-slate-500">
              <span className="font-semibold tabular-nums text-slate-800">{total}</span>{" "}
              {total === 1 ? "equipamento" : "equipamentos"}
            </p>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 sm:max-w-[290px]">
          <ScheduleManager devices={devices} canManageSchedules={canManageSchedules} />
          <div className="grid grid-cols-[minmax(0,1fr)_56px_72px] items-stretch gap-2">
            <div className="flex h-16 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/65 px-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xl font-semibold leading-tight tabular-nums text-slate-900">{availability}%</p>
                <p className="text-xs text-slate-500">Online</p>
              </div>
            </div>
            <div className="flex h-16 items-center justify-center rounded-xl border border-slate-200/80 bg-white/65">
              <NotificationCenter devices={devices} />
            </div>
            <UserMenu name={userName} role={userRole} />
          </div>
        </div>
      </div>
    </header>
  );
}
