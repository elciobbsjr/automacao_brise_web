"use client";

import {
  useEffect,
  useState,
  type ReactNode,
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

import {
  getSensorCalibrationDiagnostic,
} from "@/utils/sensor-calibration";

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

  const calibration =
    getSensorCalibrationDiagnostic(
      device,
    );

  const visualState =
    !device.online
      ? "offline"
      : isRunning
        ? "on"
        : "off";

  const cardStyles = {
    on: {
      card:
        "border-emerald-100/90 bg-gradient-to-br from-white via-white to-emerald-50/50",

      accent:
        "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400",

      glow:
        "bg-emerald-200/25",

      icon:
        "border-emerald-100 bg-emerald-50 text-emerald-700",

      temperature:
        "border-emerald-100/80 bg-gradient-to-r from-emerald-50/70 via-white to-white",

      temperatureIcon:
        "bg-emerald-100/80 text-emerald-700",
    },

    off: {
      card:
        "border-slate-200/90 bg-gradient-to-br from-white via-white to-blue-50/40",

      accent:
        "bg-gradient-to-r from-slate-500 via-blue-500 to-sky-400",

      glow:
        "bg-blue-200/20",

      icon:
        "border-blue-100 bg-blue-50 text-blue-700",

      temperature:
        "border-blue-100/80 bg-gradient-to-r from-blue-50/60 via-white to-white",

      temperatureIcon:
        "bg-blue-100/80 text-blue-700",
    },

    offline: {
      card:
        "border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/65",

      accent:
        "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300",

      glow:
        "bg-amber-200/25",

      icon:
        "border-amber-100 bg-amber-50 text-amber-700",

      temperature:
        "border-amber-100 bg-amber-50/60",

      temperatureIcon:
        "bg-amber-100 text-amber-700",
    },
  };

  const styles =
    cardStyles[visualState];

  /*
   * Mantém o modal aberto
   * após atualizar a página.
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
      <article
        className={`group relative flex h-full flex-col overflow-hidden rounded-[24px] border shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] ${styles.card}`}
      >
        {/* LINHA DE ESTADO */}

        <div
          className={`absolute inset-x-0 top-0 h-[3px] ${styles.accent}`}
        />

        {/* BRILHO */}

        <div
          className={`pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full opacity-50 blur-3xl ${styles.glow}`}
        />

        <div className="relative flex h-full flex-col p-5">
          {/* ======================================
              CABEÇALHO
              ====================================== */}

          <header className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm ${styles.icon}`}
              >
                <AirConditionerIcon />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold tracking-tight text-slate-950">
                  {name}
                </h3>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {model}
                  <span className="mx-1.5 text-slate-300">
                    ·
                  </span>
                  Nº{" "}
                  <span className="font-mono font-semibold text-slate-500">
                    {device.deviceId}
                  </span>
                </p>
              </div>
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
              {/* ==================================
                  LEITURAS PRINCIPAIS
                  ================================== */}

              <div
                className={`mt-4 rounded-2xl border p-4 ${styles.temperature}`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* TEMPERATURA */}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${styles.temperatureIcon}`}
                      >
                        <TemperatureIcon />
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                        Temperatura ambiente
                      </span>
                    </div>

                    <p className="mt-2 text-[36px] font-bold leading-none tracking-[-0.045em] text-slate-950">
                      {temperature}
                    </p>
                  </div>

                  {/* ÍCONE CLIMATIZAÇÃO */}

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/65 text-slate-300 shadow-sm">
                    <ClimateIcon />
                  </div>
                </div>

                {/* MÉTRICAS SECUNDÁRIAS */}

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200/60 pt-3">
                  <CompactMetric
                    label="Umidade"
                    value={humidity}
                    tone="cyan"
                    icon={
                      <HumidityIcon />
                    }
                  />

                  <CompactMetric
                    label="Consumo estimado"
                    value={consumption}
                    tone="indigo"
                    icon={
                      <EnergyIcon />
                    }
                  />
                </div>
              </div>

              {/* ==================================
                  DIVERGÊNCIA
                  ================================== */}

              {calibration.needsRecalibration ? (
                <DeviceCalibrationAlert />
              ) : diagnostic.divergent ? (
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
              ) : null}

              {/* ==================================
                  CONTROLE RÁPIDO
                  ================================== */}

              <div className="mt-3 border-t border-slate-200/70 pt-3">
                <DeviceQuickControl
                  device={device}
                />
              </div>

              {/* ==================================
                  DETALHES
                  ================================== */}

              <div className="mt-auto pt-3">
                <button
                  type="button"
                  onClick={
                    openDetails
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:border-slate-900 hover:bg-slate-900 hover:shadow-md"
                >
                  <span>
                    Ver detalhes
                  </span>

                  <ArrowRightIcon />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* ==================================
                  OFFLINE
                  ================================== */}

              <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-amber-200/40 blur-xl" />

                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
                    <OfflineIcon />
                  </div>
                </div>

                <p className="mt-4 font-bold text-slate-900">
                  Sem comunicação
                </p>

                <p className="mt-1.5 max-w-[260px] text-sm leading-5 text-slate-500">
                  Não foi possível obter
                  as informações atuais
                  deste equipamento.
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />

                  <span className="text-xs font-semibold text-amber-700">
                    Verificar conexão
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  openDetails
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:border-slate-900 hover:bg-slate-900 hover:shadow-md"
              >
                <span>
                  Ver detalhes
                </span>

                <ArrowRightIcon />
              </button>
            </>
          )}
        </div>
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
    <div className="mt-3 overflow-hidden rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50/60">
      <div className="flex">
        <div className="w-1 shrink-0 bg-amber-500" />

        <div className="flex flex-1 items-start gap-3 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <WarningIcon />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold text-amber-950">
                Estado físico divergente
              </p>

              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-amber-700">
                Atenção
              </span>
            </div>

            <p className="mt-1 text-[11px] leading-4 text-amber-800">
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
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   ALERTA DE RECALIBRAÇÃO
   ========================================== */

function DeviceCalibrationAlert() {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-amber-300/90 bg-gradient-to-r from-amber-50 via-orange-50/70 to-red-50/50">
      <div className="flex">
        <div className="w-1 shrink-0 bg-amber-500" />

        <div className="flex flex-1 items-start gap-3 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <WarningIcon />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold text-amber-950">
                Recalibração necessária
              </p>

              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-amber-700">
                Calibração
              </span>
            </div>

            <p className="mt-1 text-[11px] leading-4 text-amber-800">
              As referências ON/OFF do acelerômetro
              estão inconsistentes. Recalibre o
              equipamento para evitar uma indicação
              incorreta do estado físico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   MÉTRICA COMPACTA
   ========================================== */

type MetricTone =
  | "cyan"
  | "indigo";

function CompactMetric({
  label,
  value,
  tone,
  icon,
}: {
  label: string;

  value: string;

  tone: MetricTone;

  icon: ReactNode;
}) {
  const styles = {
    cyan: {
      icon:
        "bg-cyan-100 text-cyan-700",
    },

    indigo: {
      icon:
        "bg-indigo-100 text-indigo-700",
    },
  };

  const current =
    styles[tone];

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${current.icon}`}
        >
          {icon}
        </div>

        <p className="truncate text-[9px] font-bold uppercase tracking-[0.09em] text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-1.5 truncate text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function AirConditionerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="11"
        rx="2"
      />

      <path d="M7 11h10" />

      <path d="M8 16v2" />

      <path d="M12 16v3" />

      <path d="M16 16v2" />
    </svg>
  );
}

function TemperatureIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z" />

      <path d="M10 5v10" />
    </svg>
  );
}

function ClimateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M12 2v20" />

      <path d="m4.93 6.93 14.14 10.14" />

      <path d="m19.07 6.93-14.14 10.14" />

      <path d="m9 4 3 3 3-3" />

      <path d="m9 20 3-3 3 3" />

      <path d="m4.5 10.5 4.1.6-.6-4.1" />

      <path d="m19.5 13.5-4.1-.6.6 4.1" />
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="M12 3s6 6.2 6 11a6 6 0 1 1-12 0c0-4.8 6-11 6-11Z" />

      <path d="M9.5 15.5a3 3 0 0 0 4 1" />
    </svg>
  );
}

function EnergyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M5 12.55a11 11 0 0 1 14.08-.67" />

      <path d="M1.42 9a16 16 0 0 1 21.16-.72" />

      <path d="M8.53 16.11a6 6 0 0 1 6.95-.11" />

      <path d="M12 20h.01" />

      <path d="M3 3 21 21" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 9v4" />

      <path d="M12 17h.01" />

      <path d="M10.3 3.6 2.4 17.3A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.7L13.7 3.6a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />

      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}