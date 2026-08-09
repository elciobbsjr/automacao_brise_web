"use client";

import type { DashboardDevice } from "@/types/dashboard";

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

interface DeviceDetailsModalProps {
  device: DashboardDevice;
  open: boolean;
  onClose: () => void;
}

export function DeviceDetailsModal({
  device,
  open,
  onClose,
}: DeviceDetailsModalProps) {
  if (!open) {
    return null;
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Dispositivo Nº {device.deviceId}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {name}
            </h2>

            <p className="mt-1 text-gray-600">
              {model}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Fechar
          </button>
        </header>

        {!device.online ? (
          <div className="rounded-xl bg-gray-100 p-5">
            <p className="font-semibold text-gray-800">
              Dispositivo sem resposta
            </p>

            <p className="mt-1 text-sm text-gray-600">
              O equipamento pode estar desligado, offline ou com
              credenciais inválidas.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ModalSection title="Leituras atuais">
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
                value={formatBtu(device.config?.btu)}
              />
            </ModalSection>

            <ModalSection title="Operação">
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
                value={formatSetpoint(
                  device.parameters?.setpointCool,
                )}
              />

              <DetailItem
                label="Setpoint aquecimento"
                value={formatSetpoint(
                  device.parameters?.setpointHeat,
                )}
              />

              <DetailItem
                label="Eco refrigeração"
                value={formatSetpoint(
                  device.parameters?.ecoCool,
                )}
              />

              <DetailItem
                label="Eco aquecimento"
                value={formatSetpoint(
                  device.parameters?.ecoHeat,
                )}
              />
            </ModalSection>

            <ModalSection title="Configuração">
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

              <DetailItem
                label="Dia do log"
                value={
                  device.config?.logDay !== undefined
                    ? String(device.config.logDay)
                    : "Indisponível"
                }
              />
            </ModalSection>

            <ModalSection title="Contadores técnicos">
              <DetailItem
                label="WM"
                value={formatCounter(
                  device.variables?.WM,
                )}
              />

              <DetailItem
                label="ON"
                value={formatCounter(
                  device.variables?.ON,
                )}
              />

              <DetailItem
                label="OFF"
                value={formatCounter(
                  device.variables?.OFF,
                )}
              />

              <DetailItem
                label="ACC"
                value={formatCounter(
                  device.variables?.ACC,
                )}
              />
            </ModalSection>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        {title}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
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
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function formatSetpoint(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  if (value === 0) {
    return "Desativado";
  }

  return `${value} °C`;
}

function formatCounter(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  return value.toLocaleString("pt-BR");
}