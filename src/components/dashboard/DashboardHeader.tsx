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
  const total = devices.length;
  const onlineDevices = devices.filter((device) => device.online).length;
  const availability = total > 0
    ? Math.round((onlineDevices / total) * 100)
    : 0;

  return (
    <header className="relative z-10 overflow-visible rounded-2xl border border-slate-200/90 border-t-2 border-t-blue-600 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.055)]">
      <div className="flex flex-col gap-5 px-5 py-4 sm:px-6 lg:min-h-[104px] lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <div className="relative h-12 w-12 sm:h-[54px] sm:w-[54px]">
              <Image
                src="/tre-ma.png"
                alt="TRE-MA"
                fill
                sizes="54px"
                priority
                className="object-contain"
              />
            </div>

            <div className="h-9 w-px bg-slate-200" />

            <div className="relative h-11 w-[126px] sm:h-12 sm:w-[158px]">
              <Image
                src="/semeq-completo.png"
                alt="SEMEQ - Seção de Manutenção de Equipamentos"
                fill
                sizes="158px"
                priority
                className="object-contain"
              />
            </div>
          </div>

          <div className="hidden h-10 w-px bg-slate-200 lg:block" />

          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[-0.01em] text-slate-800 sm:text-[15px]">
              Central de Climatização
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tribunal Regional Eleitoral do Maranhão
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 lg:justify-end lg:border-t-0 lg:pt-0">
          <div className="flex items-center gap-3">
            <ScheduleManager
              devices={devices}
              canManageSchedules={canManageSchedules}
            />

            <div
              className="flex items-center gap-2 border-l border-slate-200 pl-3"
              title={`${onlineDevices} de ${total} equipamentos online`}
              aria-label={`${availability}% dos equipamentos online`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-800">
                {availability}%
              </span>
              <span className="hidden text-xs text-slate-500 sm:inline">
                online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <NotificationCenter devices={devices} />
            <UserMenu
              name={userName}
              role={userRole}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
