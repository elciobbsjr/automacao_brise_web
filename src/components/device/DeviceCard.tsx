"use client";

import {
  useState,
} from "react";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  DeviceDetailsModal,
} from "./DeviceDetailsModal";

import {
  DeviceQuickControl,
} from "./DeviceQuickControl";

import {
  formatConsumption,
  formatPercentage,
  formatTemperature,
} from "@/utils/formatters";

import {
  DeviceStatusBadge,
} from "./DeviceStatusBadge";

interface DeviceCardProps {
  device: DashboardDevice;
}

export function DeviceCard({
  device,
}: DeviceCardProps) {
  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const name =
    device.config?.name ||
    `Dispositivo ${device.deviceId}`;

  const model =
    device.config?.MODEL ||
    "Modelo indisponível";

  const isRunning =
    device.variables
      ?.state === true;

  const temperature =
    formatTemperature(
      device.variables
        ?.temperature,
    );

  const humidity =
    formatPercentage(
      device.variables
        ?.humidity,
    );

  const consumption =
    formatConsumption(
      device.variables
        ?.consumptionEstimated,
    );

  return (
    <>
      <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900">
              {name}
            </h3>

            <p className="mt-1 truncate text-sm text-slate-500">
              {model} · Nº{" "}
              {device.deviceId}
            </p>
          </div>

          <div className="shrink-0">
            <DeviceStatusBadge
              online={
                device.online
              }
              running={
                isRunning
              }
            />
          </div>
        </header>

        {device.online ? (
          <>
            <div className="py-7 text-center">
              <p className="text-5xl font-bold tracking-tight text-slate-900">
                {temperature}
              </p>

              <p className="mt-2 text-sm font-medium text-slate-500">
                Temperatura ambiente
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Umidade"
                value={humidity}
              />

              <Metric
                label="Consumo estimado"
                value={consumption}
              />
            </div>

            <DeviceQuickControl
              device={device}
            />

            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={() =>
                  setDetailsOpen(
                    true,
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                Ver detalhes
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-1 flex-col items-center justify-center py-9 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Sem comunicação
              </p>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Não foi possível obter
                as informações atuais
                deste equipamento.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setDetailsOpen(
                  true,
                )
              }
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Ver detalhes
            </button>
          </>
        )}
      </article>

      <DeviceDetailsModal
        device={device}
        open={detailsOpen}
        onClose={() =>
          setDetailsOpen(
            false,
          )
        }
      />
    </>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-base font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}