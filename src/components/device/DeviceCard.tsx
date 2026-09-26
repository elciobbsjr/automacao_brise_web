"use client";

import {
  useEffect,
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

import {
  formatDetectedState,
  getDeviceStateDiagnostic,
} from "@/utils/device-diagnostics";

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
    device.variables?.state ===
    true;

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

  const diagnostic =
    getDeviceStateDiagnostic(
      device,
    );

  /*
   * Ao carregar ou atualizar a
   * página, verifica se a URL
   * informa que este dispositivo
   * deve estar aberto.
   *
   * Exemplo:
   *
   * /?device=105679
   */
  useEffect(() => {
    function syncModalWithUrl() {
      const params =
        new URLSearchParams(
          window.location.search,
        );

      const selectedDevice =
        params.get("device");

      setDetailsOpen(
        selectedDevice ===
          String(
            device.deviceId,
          ),
      );
    }

    syncModalWithUrl();

    /*
     * Também mantém sincronizado
     * caso a navegação do navegador
     * altere a URL.
     */
    window.addEventListener(
      "popstate",
      syncModalWithUrl,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        syncModalWithUrl,
      );
    };
  }, [device.deviceId]);

  function openDetails() {
    setDetailsOpen(true);

    const url =
      new URL(
        window.location.href,
      );

    url.searchParams.set(
      "device",
      String(
        device.deviceId,
      ),
    );

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  function closeDetails() {
    setDetailsOpen(false);

    const url =
      new URL(
        window.location.href,
      );

    /*
     * Só removemos o parâmetro
     * se ele pertence a este
     * dispositivo.
     */
    if (
      url.searchParams.get(
        "device",
      ) ===
      String(
        device.deviceId,
      )
    ) {
      url.searchParams.delete(
        "device",
      );
    }

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

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
              {
                device.deviceId
              }
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

            {diagnostic.divergent && (
              <DeviceDivergenceAlert
                logicalState={
                  formatDetectedState(
                    diagnostic.logicalState,
                  )
                }
                physicalState={
                  formatDetectedState(
                    diagnostic.physicalState,
                  )
                }
              />
            )}

            <DeviceQuickControl
              device={device}
            />

            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={
                  openDetails
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
              onClick={
                openDetails
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
        onClose={
          closeDetails
        }
      />
    </>
  );
}

/* ==========================================
   ALERTA DE DIVERGÊNCIA
   ========================================== */

function DeviceDivergenceAlert({
  logicalState,
  physicalState,
}: {
  logicalState: string;
  physicalState: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-amber-700"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.6 2.4 17.3A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.7L13.7 3.6a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            Estado físico divergente
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-800">
            Brise informa{" "}
            <strong>
              {logicalState}
            </strong>
            , mas o acelerômetro
            detecta{" "}
            <strong>
              {physicalState}
            </strong>
            .
          </p>

          <p className="mt-1 text-xs text-amber-700">
            Abra os detalhes para
            visualizar o diagnóstico
            completo.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   MÉTRICA
   ========================================== */

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