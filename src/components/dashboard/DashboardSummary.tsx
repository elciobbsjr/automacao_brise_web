import type { DashboardResponse } from "@/types/dashboard";

import { SummaryCard } from "./SummaryCard";

interface DashboardSummaryProps {
  dashboard: DashboardResponse;
}

export function DashboardSummary({
  dashboard,
}: DashboardSummaryProps) {
  const activeDevices =
    dashboard.devices.filter(
      (device) =>
        device.variables?.state === true,
    ).length;

  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total de dispositivos"
        value={String(dashboard.total)}
      />

      <SummaryCard
        title="Respondendo"
        value={String(dashboard.online)}
      />

      <SummaryCard
        title="Sem resposta"
        value={String(dashboard.offline)}
      />

      <SummaryCard
        title="Ar-condicionados ligados"
        value={String(activeDevices)}
      />
    </section>
  );
}