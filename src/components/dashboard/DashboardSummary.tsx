import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  SummaryCard,
} from "./SummaryCard";

import type {
  DeviceFilter,
} from "./DeviceFilters";

interface DashboardSummaryProps {
  devices: DashboardDevice[];

  onFilterSelect: (
    filter: DeviceFilter,
  ) => void;
}

export function DashboardSummary({
  devices,
  onFilterSelect,
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
    <section className="mb-9">
      {/* CABEÇALHO */}

      <div className="mb-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600" />

          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
            Monitoramento
          </h2>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Situação atual dos
          equipamentos selecionados.
        </p>
      </div>

      {/* CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Equipamentos"
          value={String(total)}
          description="Total monitorado"
          status="neutral"
          onClick={() =>
            onFilterSelect(
              "all",
            )
          }
        />

        <SummaryCard
          title="Ligados"
          value={String(
            activeDevices,
          )}
          description="Em operação"
          status="on"
          onClick={() =>
            onFilterSelect(
              "on",
            )
          }
        />

        <SummaryCard
          title="Desligados"
          value={String(
            inactiveDevices,
          )}
          description="Disponíveis e desligados"
          status="off"
          onClick={() =>
            onFilterSelect(
              "off",
            )
          }
        />

        <SummaryCard
          title="Sem resposta"
          value={String(
            offlineDevices,
          )}
          description="Verificar conexão"
          status="offline"
          onClick={() =>
            onFilterSelect(
              "offline",
            )
          }
        />
      </div>
    </section>
  );
}