"use client";

import {
  useState,
  type ReactNode,
} from "react";


import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  DeviceControl,
} from "./DeviceControl";

import {
  DeviceStatusBadge,
} from "./DeviceStatusBadge";

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

import {
  formatDetectedState,
  formatMovementState,
  formatShutdownReason,
  getDeviceStateDiagnostic,
  type DeviceDetectedState,
  type DeviceMovementState,
  type DeviceShutdownReason,
} from "@/utils/device-diagnostics";

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
    device.parameters?.modeDevice !==
    undefined
      ? DEVICE_MODES[
          device.parameters.modeDevice
        ]
      : "Indisponível";

  const modeAC =
    device.parameters?.modeAC !==
    undefined
      ? AC_MODES[
          device.parameters.modeAC
        ]
      : "Indisponível";

  const fanSpeed =
    device.parameters?.fanSpeed !==
    undefined
      ? FAN_SPEEDS[
          device.parameters.fanSpeed
        ]
      : "Indisponível";

  const isRunning =
    device.variables?.state === true;

  const diagnostic =
    getDeviceStateDiagnostic(
      device,
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-md sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[94vh] w-[96vw] max-w-[1680px] overflow-hidden rounded-[30px] border border-white/70 bg-slate-50/95 shadow-[0_35px_110px_rgba(15,23,42,0.38)] backdrop-blur-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ==========================================
            FUNDO DO MODAL
            ========================================== */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/95 to-blue-50/75" />

          <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-200/25 blur-3xl" />

          <div className="absolute -bottom-48 left-[30%] h-[400px] w-[400px] rounded-full bg-cyan-100/20 blur-3xl" />

          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-slate-900 via-blue-600 to-cyan-400" />
        </div>

        <div className="relative flex max-h-[94vh] flex-col">
          {/* ==========================================
              CABEÇALHO
              ========================================== */}

          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur-2xl sm:px-7 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm sm:flex ${
                    device.online
                      ? isRunning
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-blue-100 bg-blue-50 text-blue-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  <AirConditionerIcon />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-500">
                      Nº {device.deviceId}
                    </span>

                    <DeviceStatusBadge
                      online={
                        device.online
                      }
                      running={
                        isRunning
                      }
                    />
                  </div>

                  <h2 className="mt-2 truncate text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-[28px]">
                    {name}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {model}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
              >
                <CloseIcon />
              </button>
            </div>
          </header>

          {/* ==========================================
              CONTEÚDO
              ========================================== */}

          <div className="overflow-y-auto">
            {!device.online ? (
              <div className="p-5 sm:p-7">
                <OfflineState />
              </div>
            ) : (
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1.15fr)_520px] 2xl:grid-cols-[minmax(0,1.2fr)_560px]">
                {/* ==================================
                    COLUNA DE INFORMAÇÕES
                    ================================== */}

                <div className="min-w-0 space-y-5">
                  {/* MÉTRICAS */}

                  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <PrimaryMetric
                      label="Estado"
                      value={
                        isRunning
                          ? "Ligado"
                          : "Desligado"
                      }
                      helper="Estado informado"
                      tone={
                        isRunning
                          ? "green"
                          : "slate"
                      }
                      icon={
                        <PowerIcon />
                      }
                    />

                    <PrimaryMetric
                      label="Temperatura"
                      value={formatTemperature(
                        device.variables
                          ?.temperature,
                      )}
                      helper="Ambiente"
                      tone="blue"
                      icon={
                        <TemperatureIcon />
                      }
                    />

                    <PrimaryMetric
                      label="Umidade"
                      value={formatPercentage(
                        device.variables
                          ?.humidity,
                      )}
                      helper="Umidade relativa"
                      tone="cyan"
                      icon={
                        <HumidityIcon />
                      }
                    />

                    <PrimaryMetric
                      label="Consumo estimado"
                      value={formatConsumption(
                        device.variables
                          ?.consumptionEstimated,
                      )}
                      helper="Mês vigente"
                      tone="indigo"
                      icon={
                        <EnergyIcon />
                      }
                    />
                  </section>

                  {/* LEITURAS */}

                  <ModalSection
                    title="Leituras atuais"
                    description="Informações coletadas pelo equipamento."
                    tone="blue"
                    icon={
                      <ReadingsIcon />
                    }
                  >
                    <DetailItem
                      label="Consumo medido"
                      value={formatConsumption(
                        device.variables
                          ?.consumption,
                      )}
                    />

                    <DetailItem
                      label="Consumo estimado"
                      value={formatConsumption(
                        device.variables
                          ?.consumptionEstimated,
                      )}
                    />

                    <DetailItem
                      label="Capacidade"
                      value={formatBtu(
                        device.config?.btu,
                      )}
                    />
                  </ModalSection>

                  {/* OPERAÇÃO */}

                  <ModalSection
                    title="Operação"
                    description="Parâmetros atualmente configurados."
                    tone="cyan"
                    icon={
                      <ControlIcon />
                    }
                  >
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
                        device.parameters
                          ?.setpointCool,
                      )}
                    />

                    <DetailItem
                      label="Setpoint aquecimento"
                      value={formatSetpoint(
                        device.parameters
                          ?.setpointHeat,
                      )}
                    />

                    <DetailItem
                      label="Eco refrigeração"
                      value={formatSetpoint(
                        device.parameters
                          ?.ecoCool,
                      )}
                    />

                    <DetailItem
                      label="Eco aquecimento"
                      value={formatSetpoint(
                        device.parameters
                          ?.ecoHeat,
                      )}
                    />
                  </ModalSection>

                  {/* CONFIGURAÇÃO */}

                  <CollapsibleSection
                    title="Configuração"
                    description="Preferências e características do dispositivo."
                    tone="indigo"
                    icon={
                      <SettingsIcon />
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailItem
                        label="Modelo"
                        value={model}
                      />

                      <DetailItem
                        label="Fuso horário"
                        value={
                          device.config
                            ?.timeZone !==
                          undefined
                            ? `UTC${device.config.timeZone}`
                            : "Indisponível"
                        }
                      />

                      <DetailItem
                        label="Ventilação habilitada"
                        value={
                          device.config
                            ?.enableFan
                            ? "Sim"
                            : "Não"
                        }
                      />

                      <DetailItem
                        label="Aquecimento habilitado"
                        value={
                          device.config
                            ?.enableHeat
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
                          device.config
                            ?.logDay !==
                          undefined
                            ? String(
                                device.config
                                  .logDay,
                              )
                            : "Indisponível"
                        }
                      />
                    </div>
                  </CollapsibleSection>
                  

                  {/* DIAGNÓSTICO */}

                  <CollapsibleSection
                    title="Diagnóstico do equipamento"
                    description="Estado físico, acelerômetro e sensor de movimento."
                    tone={
                      diagnostic.divergent
                        ? "amber"
                        : "emerald"
                    }
                    icon={
                      <DiagnosticIcon />
                    }
                    trailing={
                      <DiagnosticBadge
                        available={
                          diagnostic.logicalState !==
                            "unknown" &&
                          diagnostic.physicalState !==
                            "unknown"
                        }
                        divergent={
                          diagnostic.divergent
                        }
                      />
                    }
                  >
                    <DeviceDiagnosticContent
                      logicalState={
                        diagnostic.logicalState
                      }
                      physicalState={
                        diagnostic.physicalState
                      }
                      divergent={
                        diagnostic.divergent
                      }
                      distanceToOn={
                        diagnostic
                          .accelerometer
                          .distanceToOn
                      }
                      distanceToOff={
                        diagnostic
                          .accelerometer
                          .distanceToOff
                      }
                      wm={
                        diagnostic.wm
                      }
                      movementState={
                        diagnostic.movementState
                      }
                      shutdownReason={
                        diagnostic.shutdownReason
                      }
                    />
                  </CollapsibleSection>

                  {/* DADOS TÉCNICOS */}

                  <CollapsibleSection
                    title="Dados técnicos dos sensores"
                    description="ACC, ON, OFF e WM utilizados pelo diagnóstico."
                    tone="violet"
                    icon={
                      <SensorIcon />
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailItem
                        label="Leitura atual (ACC)"
                        value={formatCounter(
                          device.variables
                            ?.ACC,
                        )}
                        helper="Leitura atual do acelerômetro."
                      />

                      <DetailItem
                        label="Referência ligado (ON)"
                        value={formatCounter(
                          device.variables
                            ?.ON,
                        )}
                        helper="Calibração da máquina ligada."
                      />

                      <DetailItem
                        label="Referência desligado (OFF)"
                        value={formatCounter(
                          device.variables
                            ?.OFF,
                        )}
                        helper="Calibração da máquina desligada."
                      />

                      <DetailItem
                        label="WM"
                        value={formatCounter(
                          device.variables
                            ?.WM,
                        )}
                        helper="Valor bruto relacionado à ausência de movimento."
                      />
                    </div>
                  </CollapsibleSection>
                  </div>

                {/* ==================================
                    CONTROLE
                    ================================== */}

                <aside className="lg:sticky lg:top-5 lg:self-start">
                  <div className="relative overflow-hidden rounded-[26px] border border-blue-100/80 bg-white/85 shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

                    <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-100/50 blur-3xl" />

                    <div className="relative p-5 xl:p-6">
                      <div className="mb-5 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <RemoteIcon />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-slate-950">
                            Controle do equipamento
                          </h3>

                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            Ajuste o funcionamento do
                            ar-condicionado em tempo real.
                          </p>
                        </div>
                      </div>

                      <DeviceControl
                        device={device}
                      />
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   DIAGNÓSTICO
   ========================================== */

function DeviceDiagnosticContent({
  logicalState,
  physicalState,
  divergent,
  distanceToOn,
  distanceToOff,
  wm,
  movementState,
  shutdownReason,
}: {
  logicalState:
    DeviceDetectedState;

  physicalState:
    DeviceDetectedState;

  divergent: boolean;

  distanceToOn:
    number | null;

  distanceToOff:
    number | null;

  wm:
    number | null;

  movementState:
    DeviceMovementState;

  shutdownReason:
    DeviceShutdownReason;
}) {
  const hasCompleteDiagnostic =
    logicalState !==
      "unknown" &&
    physicalState !==
      "unknown";

  const absenceDetected =
    movementState ===
    "absence";

  return (
    <div>
      {/* ESTADOS */}

      <div className="grid gap-3 sm:grid-cols-3">
        <DiagnosticStateCard
          label="Estado informado"
          value={formatDetectedState(
            logicalState,
          )}
          helper="Informado pelo Brise"
          state={
            logicalState
          }
        />

        <DiagnosticStateCard
          label="Estado físico"
          value={formatDetectedState(
            physicalState,
          )}
          helper="Detectado pelo acelerômetro"
          state={
            physicalState
          }
        />

        <DiagnosticSituationCard
          available={
            hasCompleteDiagnostic
          }
          divergent={
            divergent
          }
        />
      </div>

      {/* MOVIMENTO */}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <MovementDiagnosticCard
          label="Movimento"
          value={formatMovementState(
            movementState,
          )}
          helper={
            absenceDetected
              ? "O sensor informou ausência de movimento."
              : wm === null
                ? "WM indisponível."
                : `WM = ${wm}. Valor ainda não mapeado.`
          }
          warning={
            absenceDetected
          }
        />

        <MovementDiagnosticCard
          label="Motivo do desligamento"
          value={formatShutdownReason(
            shutdownReason,
          )}
          helper={
            shutdownReason ===
            "absence"
              ? "O Brise informou desligamento após ausência de movimento."
              : shutdownReason ===
                  "device_on"
                ? "O equipamento permanece informado como ligado."
                : "Não foi possível identificar o motivo."
          }
          warning={
            shutdownReason ===
            "absence"
          }
        />
      </div>

      {/* DISTÂNCIAS */}

      {physicalState !==
        "unknown" && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DiagnosticDistance
            label="Distância para Ligado"
            value={
              distanceToOn
            }
          />

          <DiagnosticDistance
            label="Distância para Desligado"
            value={
              distanceToOff
            }
          />
        </div>
      )}

      {/* EXPLICAÇÃO */}

      <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
        <p className="text-[11px] leading-5 text-slate-500">
          O estado físico é obtido
          comparando ACC com as
          referências ON e OFF. A
          referência mais próxima
          representa o estado
          detectado da máquina.
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          Para WM, atualmente apenas{" "}
          <strong className="text-slate-700">
            WM = 0
          </strong>{" "}
          possui interpretação
          confirmada: ausência de
          movimento.
        </p>
      </div>
    </div>
  );
}
/* ==========================================
   BADGE DO DIAGNÓSTICO
   ========================================== */

function DiagnosticBadge({
  available,
  divergent,
}: {
  available: boolean;
  divergent: boolean;
}) {
  if (!available) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
        <span className="h-2 w-2 rounded-full bg-slate-400" />

        Diagnóstico incompleto
      </span>
    );
  }

  if (divergent) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />

        Divergência detectada
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />

      Estados compatíveis
    </span>
  );
}

/* ==========================================
   CARD DE ESTADO DO DIAGNÓSTICO
   ========================================== */

function DiagnosticStateCard({
  label,
  value,
  helper,
  state,
}: {
  label: string;
  value: string;
  helper: string;
  state:
    DeviceDetectedState;
}) {
  const indicatorClass =
    state === "on"
      ? "bg-emerald-500"
      : state === "off"
        ? "bg-slate-400"
        : "bg-amber-400";

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${indicatorClass}`}
        />

        <p className="text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>

      <p className="mt-1 text-[11px] text-slate-500">
        {helper}
      </p>
    </div>
  );
}

/* ==========================================
   SITUAÇÃO
   ========================================== */

function DiagnosticSituationCard({
  available,
  divergent,
}: {
  available: boolean;
  divergent: boolean;
}) {
  let value =
    "Indeterminado";

  let helper =
    "Dados insuficientes.";

  let indicatorClass =
    "bg-slate-400";

  if (available) {
    if (divergent) {
      value =
        "Divergência";

      helper =
        "Os estados não correspondem.";

      indicatorClass =
        "bg-amber-500";
    } else {
      value =
        "Normal";

      helper =
        "Os estados são compatíveis.";

      indicatorClass =
        "bg-emerald-500";
    }
  }

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        Situação
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${indicatorClass}`}
        />

        <p className="text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>

      <p className="mt-1 text-[11px] text-slate-500">
        {helper}
      </p>
    </div>
  );
}

/* ==========================================
   MOVIMENTO
   ========================================== */

function MovementDiagnosticCard({
  label,
  value,
  helper,
  warning,
}: {
  label: string;
  value: string;
  helper: string;
  warning: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 ${
        warning
          ? "border-amber-200 bg-amber-50/80"
          : "border-slate-200/70 bg-white/70"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            warning
              ? "bg-amber-500"
              : "bg-slate-400"
          }`}
        />

        <p
          className={`text-sm font-bold ${
            warning
              ? "text-amber-900"
              : "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>

      <p
        className={`mt-1 text-[11px] leading-4 ${
          warning
            ? "text-amber-700"
            : "text-slate-500"
        }`}
      >
        {helper}
      </p>
    </div>
  );
}

/* ==========================================
   DISTÂNCIA
   ========================================== */

function DiagnosticDistance({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-slate-50/80 px-4 py-2.5">
      <span className="text-[11px] font-medium text-slate-500">
        {label}
      </span>

      <span className="font-mono text-xs font-bold text-slate-700">
        {formatCounter(
          value,
        )}
      </span>
    </div>
  );
}

/* ==========================================
   ESTADO OFFLINE
   ========================================== */

function OfflineState() {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/80 p-8 text-center shadow-sm">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-amber-100/60 blur-3xl" />

      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
          <OfflineIcon />
        </div>

        <h3 className="mt-5 text-lg font-bold text-slate-900">
          Dispositivo sem resposta
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Não foi possível obter os
          dados atuais do equipamento.
          Ele pode estar desligado,
          offline ou temporariamente
          sem comunicação.
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   SEÇÃO PADRÃO
   ========================================== */

type SectionTone =
  | "blue"
  | "cyan"
  | "indigo"
  | "violet";

/* ==========================================
   SEÇÃO RECOLHÍVEL
   ========================================== */

type CollapsibleTone =
  | "indigo"
  | "violet"
  | "emerald"
  | "amber";

function CollapsibleSection({
  title,
  description,
  tone,
  icon,
  trailing,
  children,
}: {
  title: string;

  description?: string;

  tone:
    CollapsibleTone;

  icon:
    ReactNode;

  trailing?:
    ReactNode;

  children:
    ReactNode;
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const styles = {
    indigo: {
      icon:
        "bg-indigo-50 text-indigo-700",

      dot:
        "bg-indigo-600",

      border:
        "border-indigo-100/70",
    },

    violet: {
      icon:
        "bg-violet-50 text-violet-700",

      dot:
        "bg-violet-600",

      border:
        "border-violet-100/70",
    },

    emerald: {
      icon:
        "bg-emerald-50 text-emerald-700",

      dot:
        "bg-emerald-500",

      border:
        "border-emerald-100/80",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-700",

      dot:
        "bg-amber-500",

      border:
        "border-amber-200/80",
    },
  };

  const current =
    styles[tone];

  return (
    <section
      className={`overflow-hidden rounded-[22px] border bg-white/75 shadow-sm backdrop-blur-xl ${current.border}`}
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) =>
              !value,
          )
        }
        aria-expanded={
          open
        }
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50/60 sm:px-6"
      >
        {/* ÍCONE */}

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          {icon}
        </div>

        {/* TEXTO */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${current.dot}`}
            />

            <h3 className="truncate text-sm font-bold text-slate-950">
              {title}
            </h3>
          </div>

          {description && (
            <p className="mt-1 truncate text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        {/* STATUS */}

        {trailing && (
          <div className="hidden shrink-0 sm:block">
            {trailing}
          </div>
        )}

        {/* SETA */}

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition duration-200 ${
            open
              ? "rotate-180"
              : ""
          }`}
        >
          <ChevronDownIcon />
        </div>
      </button>

      {/* STATUS MOBILE */}

      {trailing &&
        !open && (
          <div className="px-5 pb-3 sm:hidden">
            {trailing}
          </div>
        )}

      {/* CONTEÚDO */}

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModalSection({
  title,
  description,
  tone,
  icon,
  children,
}: {
  title: string;
  description?: string;
  tone: SectionTone;
  icon: ReactNode;
  children: ReactNode;
}) {
  const styles = {
    blue: {
      icon:
        "bg-blue-50 text-blue-700",
      dot:
        "bg-blue-600",
    },

    cyan: {
      icon:
        "bg-cyan-50 text-cyan-700",
      dot:
        "bg-cyan-600",
    },

    indigo: {
      icon:
        "bg-indigo-50 text-indigo-700",
      dot:
        "bg-indigo-600",
    },

    violet: {
      icon:
        "bg-violet-50 text-violet-700",
      dot:
        "bg-violet-600",
    },
  };

  const current =
    styles[tone];

  return (
    <section className="rounded-[24px] border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${current.dot}`}
            />

            <h3 className="text-sm font-bold text-slate-950">
              {title}
            </h3>
          </div>

          {description && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

/* ==========================================
   MÉTRICA PRINCIPAL
   ========================================== */

type MetricTone =
  | "green"
  | "slate"
  | "blue"
  | "cyan"
  | "indigo";

function PrimaryMetric({
  label,
  value,
  helper,
  tone,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  tone: MetricTone;
  icon: ReactNode;
}) {
  const styles = {
    green: {
      box:
        "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/75",
      icon:
        "bg-emerald-50 text-emerald-700",
    },

    slate: {
      box:
        "border-slate-200 bg-gradient-to-br from-white to-slate-100/70",
      icon:
        "bg-slate-100 text-slate-600",
    },

    blue: {
      box:
        "border-blue-100 bg-gradient-to-br from-white to-blue-50/75",
      icon:
        "bg-blue-50 text-blue-700",
    },

    cyan: {
      box:
        "border-cyan-100 bg-gradient-to-br from-white to-cyan-50/75",
      icon:
        "bg-cyan-50 text-cyan-700",
    },

    indigo: {
      box:
        "border-indigo-100 bg-gradient-to-br from-white to-indigo-50/75",
      icon:
        "bg-indigo-50 text-indigo-700",
    },
  };

  const current =
    styles[tone];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${current.box}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-400">
          {label}
        </p>

        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${current.icon}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 truncate text-xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {helper}
      </p>
    </div>
  );
}

/* ==========================================
   ITEM DE DETALHES
   ========================================== */

function DetailItem({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-slate-50/65 p-3.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-bold text-slate-800">
        {value}
      </p>

      {helper && (
        <p className="mt-1 text-[11px] leading-4 text-slate-500">
          {helper}
        </p>
      )}
    </div>
  );
}

/* ==========================================
   FORMATADORES
   ========================================== */

function formatSetpoint(
  value?: number,
) {
  if (
    value === undefined
  ) {
    return "Indisponível";
  }

  if (value === 0) {
    return "Desativado";
  }

  return `${value} °C`;
}

function formatCounter(
  value?:
    | number
    | null,
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "Indisponível";
  }

  return value.toLocaleString(
    "pt-BR",
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

function PowerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 2v10" />

      <path d="M6.4 5.6A8 8 0 1 0 17.6 5.6" />
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z" />

      <path d="M10 5v10" />
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3s6 6.2 6 11a6 6 0 1 1-12 0c0-4.8 6-11 6-11Z" />
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
    </svg>
  );
}

function ReadingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 19V9" />

      <path d="M10 19V5" />

      <path d="M16 19v-7" />

      <path d="M22 19V3" />
    </svg>
  );
}

function ControlIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 7h10" />
      <path d="M18 7h2" />

      <circle
        cx="16"
        cy="7"
        r="2"
      />

      <path d="M4 17h2" />
      <path d="M10 17h10" />

      <circle
        cx="8"
        cy="17"
        r="2"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
      />

      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1.03H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1.03-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function SensorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
      />

      <path d="M5.64 5.64a9 9 0 0 0 0 12.72" />
      <path d="M18.36 5.64a9 9 0 0 1 0 12.72" />

      <path d="M8.46 8.46a5 5 0 0 0 0 7.08" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.08" />
    </svg>
  );
}

function RemoteIcon() {
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
        x="7"
        y="2"
        width="10"
        height="20"
        rx="3"
      />

      <circle
        cx="12"
        cy="7"
        r="1.5"
      />

      <path d="M10 12h4" />
      <path d="M10 16h4" />
    </svg>
  );
}

function DiagnosticIcon() {
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
      <path d="M3 12h4l2-6 4 12 2-6h6" />
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

function ChevronDownIcon() {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
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
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}