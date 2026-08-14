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
  return (
    <header className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white">
              <Image
                src="/tre-ma.png"
                alt="TRE-MA"
                width={80}
                height={80}
                priority
                className="h-auto max-h-20 w-auto object-contain"
              />
            </div>

            <div className="hidden h-14 w-px bg-gray-200 sm:block" />

            <div className="flex h-20 items-center">
              <Image
                src="/semeq-completo.png"
                alt="SEMEQ - Seção de Manutenção de Equipamentos"
                width={230}
                height={80}
                priority
                className="h-auto max-h-20 w-auto object-contain"
              />
            </div>
          </div>

          <div className="hidden h-16 w-px bg-gray-200 lg:block" />

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Brise - SEMEQ
            </h1>

            <p className="mt-1 max-w-xl text-sm text-gray-500 sm:text-base">
              Monitoramento e controle dos dispositivos de climatização
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <ScheduleManager
            devices={devices}
          />
        </div>
      </div>
    </header>
  );
}