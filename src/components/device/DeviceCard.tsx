
"use client";
import { useState } from "react";
import type { DashboardDevice } from "@/types/dashboard";




import { DeviceDetailsModal } from "./DeviceDetailsModal";

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

import { DeviceInfo } from "./DeviceInfo";
import { DeviceStatusBadge } from "./DeviceStatusBadge";

interface DeviceCardProps {
  device: DashboardDevice;
}

export function DeviceCard({
  device,
}: DeviceCardProps) {
    const [detailsOpen, setDetailsOpen] = useState(false);
  const name =
    device.config?.name ||
    `Dispositivo ${device.deviceId}`;

  const model =
    device.config?.MODEL ||
    "Modelo indisponível";

  const isRunning =
    device.variables?.state === true;

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

        <DeviceStatusBadge
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
              {formatBtu(device.config?.btu)}
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="font-medium text-gray-700">
            Dispositivo sem resposta
          </p>

          <p className="mt-1 text-sm text-gray-500">
            O equipamento pode estar desligado,
            offline ou com credenciais inválidas.
          </p>
        </div>
      )}

        <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition hover:bg-gray-700"
        >
        Ver detalhes
        </button>

        <DeviceDetailsModal
        device={device}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </article>
  );
}