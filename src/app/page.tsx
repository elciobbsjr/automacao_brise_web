import {
  AC_MODES,
  DEVICE_MODES,
  FAN_SPEEDS,
} from "@/constants/brise";

import { AutoRefresh } from "@/components/dashboard/AutoRefresh";

type DashboardDevice = {
  deviceId: number;
  online: boolean;
  config: {
    MODEL?: string;
    name?: string;
    btu?: number;
  } | null;
  variables: {
    temperature?: number;
    humidity?: number;
    consumption?: number;
    consumptionEstimated?: number;
    state?: boolean;
  } | null;
  parameters: {
    modeDevice?: number;
    modeAC?: number;
    fanSpeed?: number;
    setpointCool?: number;
    setpointHeat?: number;
    ecoCool?: number;
    ecoHeat?: number;
  } | null;
};

type DashboardResponse = {
  total: number;
  online: number;
  offline: number;
  devices: DashboardDevice[];
};

async function getDashboard(): Promise<DashboardResponse> {
  const response = await fetch(
    "http://localhost:3000/api/brise/dashboard",
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar os dispositivos.");
  }

  return response.json();
}

export default async function Home() {
  const dashboard = await getDashboard();

  const activeDevices = dashboard.devices.filter(
    (device) => device.variables?.state === true,
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
    <AutoRefresh />
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel Brise
          </h1>

          <p className="mt-2 text-gray-600">
            Monitoramento dos dispositivos de ar-condicionado
          </p>
        </header>

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

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Dispositivos
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.devices.map((device) => (
              <DeviceCard
                key={device.deviceId}
                device={device}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </article>
  );
}

function DeviceCard({
  device,
}: {
  device: DashboardDevice;
}) {
  const name =
    device.config?.name || `Dispositivo ${device.deviceId}`;

  const model = device.config?.MODEL || "Modelo indisponível";

  const isRunning = device.variables?.state === true;

  const modeDevice =
    device.parameters?.modeDevice !== undefined
      ? DEVICE_MODES[device.parameters.modeDevice]
      : "Indisponível";

  const modeAC =
    device.parameters?.modeAC !== undefined
      ? AC_MODES[device.parameters.modeAC]
      : "Indisponível";

  const fanSpeed =
    device.parameters?.fanSpeed !== undefined
      ? FAN_SPEEDS[device.parameters.fanSpeed]
      : "Indisponível";

  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {model} · Nº {device.deviceId}
          </p>
        </div>

        <StatusBadge
          online={device.online}
          running={isRunning}
        />
      </header>

      {device.online ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <DeviceInfo
              label="Temperatura"
              value={formatTemperature(
                device.variables?.temperature,
              )}
            />

            <DeviceInfo
              label="Umidade"
              value={formatPercentage(
                device.variables?.humidity,
              )}
            />

            <DeviceInfo
              label="Modo"
              value={modeDevice}
            />

            <DeviceInfo
              label="Modo do ar"
              value={modeAC}
            />

            <DeviceInfo
              label="Ventilação"
              value={fanSpeed}
            />

            <DeviceInfo
              label="Consumo estimado"
              value={formatConsumption(
                device.variables?.consumptionEstimated,
              )}
            />
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Capacidade
            </p>

            <p className="font-semibold text-gray-800">
              {device.config?.btu
                ? `${device.config.btu.toLocaleString("pt-BR")} BTU`
                : "Indisponível"}
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="font-medium text-gray-700">
            Dispositivo sem resposta
          </p>

          <p className="mt-1 text-sm text-gray-500">
            O equipamento pode estar desligado, offline ou com
            credenciais inválidas.
          </p>
        </div>
      )}

      <button
        type="button"
        className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition hover:bg-gray-700"
      >
        Ver detalhes
      </button>
    </article>
  );
}

function StatusBadge({
  online,
  running,
}: {
  online: boolean;
  running: boolean;
}) {
  if (!online) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Sem resposta
      </span>
    );
  }

  if (running) {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Ligado
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
      Desligado
    </span>
  );
}

function DeviceInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function formatTemperature(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} °C`;
}

function formatPercentage(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatConsumption(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  return `${value.toLocaleString("pt-BR")} kWh`;
}