import { notFound } from "next/navigation";

import {
  AC_MODES,
  DEVICE_MODES,
  FAN_SPEEDS,
} from "@/constants/brise";

import {
  formatBtu,
  formatConsumption,
  formatPercentage,
  formatTemperature,
} from "@/utils/formatters";

import type { DashboardDevice } from "@/types/dashboard";

interface DevicePageProps {
  params: Promise<{
    deviceId: string;
  }>;
}

async function getDevice(
  deviceId: string,
): Promise<DashboardDevice | null> {
  const response = await fetch(
    `http://localhost:3000/api/brise/devices/${deviceId}/details`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  const config =
    data.config?.success === true
      ? data.config.data
      : null;

  const variables =
    data.variables?.success === true
      ? data.variables.data
      : null;

  const parameters =
    data.parameters?.success === true
      ? data.parameters.data
      : null;

  return {
    deviceId: Number(deviceId),
    online:
      config !== null ||
      variables !== null ||
      parameters !== null,
    config,
    variables,
    parameters,
  };
}

export default async function DevicePage({
  params,
}: DevicePageProps) {
  const { deviceId } = await params;

  if (!/^\d+$/.test(deviceId)) {
    notFound();
  }

  const device = await getDevice(deviceId);

  if (!device) {
    notFound();
  }

  const name =
    device.config?.name ||
    `Dispositivo ${device.deviceId}`;

  const model =
    device.config?.MODEL ||
    "Modelo indisponível";

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
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <a
          href="/"
          className="mb-6 inline-block text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Voltar para o painel
        </a>

        <header className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Dispositivo Nº {device.deviceId}
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {name}
          </h1>

          <p className="mt-2 text-gray-600">
            {model}
          </p>
        </header>

        {!device.online ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Dispositivo sem resposta
            </h2>

            <p className="mt-2 text-gray-600">
              O equipamento pode estar desligado,
              offline ou com credenciais inválidas.
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Leituras atuais
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Estado"
                  value={
                    device.variables?.state
                      ? "Ligado"
                      : "Desligado"
                  }
                />

                <DetailItem
                  label="Temperatura"
                  value={formatTemperature(
                    device.variables?.temperature,
                  )}
                />

                <DetailItem
                  label="Umidade"
                  value={formatPercentage(
                    device.variables?.humidity,
                  )}
                />

                <DetailItem
                  label="Consumo"
                  value={formatConsumption(
                    device.variables?.consumption,
                  )}
                />

                <DetailItem
                  label="Consumo estimado"
                  value={formatConsumption(
                    device.variables?.consumptionEstimated,
                  )}
                />

                <DetailItem
                  label="Capacidade"
                  value={formatBtu(
                    device.config?.btu,
                  )}
                />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Operação
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Modo do dispositivo"
                  value={modeDevice}
                />

                <DetailItem
                  label="Modo do ar"
                  value={modeAC}
                />

                <DetailItem
                  label="Ventilação"
                  value={fanSpeed}
                />

                <DetailItem
                  label="Setpoint refrigeração"
                  value={
                    device.parameters?.setpointCool !== undefined
                      ? `${device.parameters.setpointCool} °C`
                      : "Indisponível"
                  }
                />

                <DetailItem
                  label="Setpoint aquecimento"
                  value={
                    device.parameters?.setpointHeat !== undefined
                      ? `${device.parameters.setpointHeat} °C`
                      : "Indisponível"
                  }
                />

                <DetailItem
                  label="Eco refrigeração"
                  value={
                    device.parameters?.ecoCool !== undefined
                      ? `${device.parameters.ecoCool} °C`
                      : "Indisponível"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Configuração
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Modelo"
                  value={model}
                />

                <DetailItem
                  label="Fuso horário"
                  value={
                    device.config?.timeZone !== undefined
                      ? `UTC${device.config.timeZone}`
                      : "Indisponível"
                  }
                />

                <DetailItem
                  label="Ventilação habilitada"
                  value={
                    device.config?.enableFan
                      ? "Sim"
                      : "Não"
                  }
                />

                <DetailItem
                  label="Aquecimento habilitado"
                  value={
                    device.config?.enableHeat
                      ? "Sim"
                      : "Não"
                  }
                />

                <DetailItem
                  label="Não perturbe"
                  value={
                    device.config?.dnd
                      ? "Ativado"
                      : "Desativado"
                  }
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function DetailItem({
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

      <p className="mt-1 text-lg font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}