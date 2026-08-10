import type { DashboardDevice } from "@/types/dashboard";

import { ScheduleManager } from "@/components/schedule/ScheduleManager";

interface DashboardHeaderProps {
  devices: DashboardDevice[];
}

export function DashboardHeader({
  devices,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Painel Brise
        </h1>

        <p className="mt-2 text-gray-600">
          Monitoramento dos dispositivos de ar-condicionado
        </p>
      </div>

      <ScheduleManager devices={devices} />
    </header>
  );
}