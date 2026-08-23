import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  SummaryCard,
} from "./SummaryCard";

interface DashboardSummaryProps {
  devices: DashboardDevice[];
}

export function DashboardSummary({
  devices,
}: DashboardSummaryProps) {
  const total =
    devices.length;

  const activeDevices =
    devices.filter(
      (device) =>
        device.online &&
        device.variables
          ?.state === true,
    ).length;

  const inactiveDevices =
    devices.filter(
      (device) =>
        device.online &&
        device.variables
          ?.state !== true,
    ).length;

  const offlineDevices =
    devices.filter(
      (device) =>
        !device.online,
    ).length;

  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Equipamentos"
        value={String(total)}
        description="Total monitorado"
        status="neutral"
      />

      <SummaryCard
        title="Ligados"
        value={String(
          activeDevices,
        )}
        description="Em operação"
        status="on"
      />

      <SummaryCard
        title="Desligados"
        value={String(
          inactiveDevices,
        )}
        description="Disponíveis e desligados"
        status="off"
      />

      <SummaryCard
        title="Sem resposta"
        value={String(
          offlineDevices,
        )}
        description="Verificar conexão"
        status="offline"
      />
    </section>
  );
}