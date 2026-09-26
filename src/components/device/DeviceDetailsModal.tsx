"use client";

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
          device.parameters
            .modeDevice
        ]
      : "Indisponível";

  const modeAC =
    device.parameters?.modeAC !==
    undefined
      ? AC_MODES[
          device.parameters
            .modeAC
        ]
      : "Indisponível";

  const fanSpeed =
    device.parameters?.fanSpeed !==
    undefined
      ? FAN_SPEEDS[
          device.parameters
            .fanSpeed
        ]
      : "Indisponível";

  const isRunning =
    device.variables?.state === true;

  /*
   * Diagnóstico do dispositivo:
   *
   * state
   * ACC
   * ON
   * OFF
   * WM
   */
  const diagnostic =
    getDeviceStateDiagnostic(
      device,
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="relative max-h-[94vh] w-[96vw] max-w-[1680px] overflow-hidden rounded-[28px] border border-white/40 bg-white/80 shadow-[0_30px_100px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-slate-100/30" />

        <div className="relative flex max-h-[94vh] flex-col">
          <header className="sticky top-0 z-20 border-b border-white/40 bg-white/60 px-5 py-5 backdrop-blur-2xl sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Dispositivo Nº{" "}
                    {
                      device.deviceId
                    }
                  </p>

                  <DeviceStatusBadge
                    online={
                      device.online
                    }
                    running={
                      isRunning
                    }
                  />
                </div>

                <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {model}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-xl text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
              >
                ×
              </button>
            </div>
          </header>

          <div className="overflow-y-auto">
            {!device.online ? (
              <div className="p-5 sm:p-7">
                <OfflineState />
              </div>
            ) : (
              <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_480px] xl:grid-cols-[minmax(0,1.15fr)_540px] 2xl:grid-cols-[minmax(0,1.2fr)_580px]">
                <div className="min-w-0 space-y-6">
                  {/* =================================
                      MÉTRICAS PRINCIPAIS
                      ================================= */}

                  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PrimaryMetric
                      label="Estado"
                      value={
                        isRunning
                          ? "Ligado"
                          : "Desligado"
                      }
                      helper="Estado informado pelo Brise"
                    />

                    <PrimaryMetric
                      label="Temperatura"
                      value={formatTemperature(
                        device.variables
                          ?.temperature,
                      )}
                      helper="Temperatura ambiente"
                    />

                    <PrimaryMetric
                      label="Umidade"
                      value={formatPercentage(
                        device.variables
                          ?.humidity,
                      )}
                      helper="Umidade relativa"
                    />

                    <PrimaryMetric
                      label="Consumo estimado"
                      value={formatConsumption(
                        device.variables
                          ?.consumptionEstimated,
                      )}
                      helper="Mês vigente"
                    />
                  </section>

                  {/* =================================
                      LEITURAS
                      ================================= */}

                  <ModalSection
                    title="Leituras atuais"
                    description="Informações coletadas pelo equipamento."
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
                        device.config
                          ?.btu,
                      )}
                    />
                  </ModalSection>

                  {/* =================================
                      OPERAÇÃO
                      ================================= */}

                  <ModalSection
                    title="Operação"
                    description="Parâmetros atualmente configurados no equipamento."
                  >
                    <DetailItem
                      label="Modo do dispositivo"
                      value={
                        modeDevice
                      }
                    />

                    <DetailItem
                      label="Modo do ar"
                      value={
                        modeAC
                      }
                    />

                    <DetailItem
                      label="Ventilação"
                      value={
                        fanSpeed
                      }
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

                  {/* =================================
                      CONFIGURAÇÃO
                      ================================= */}

                  <ModalSection
                    title="Configuração"
                    description="Dados técnicos e preferências do dispositivo."
                  >
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
                        device.config
                          ?.dnd
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
                              device
                                .config
                                .logDay,
                            )
                          : "Indisponível"
                      }
                    />
                  </ModalSection>

                  {/* =================================
                      DIAGNÓSTICO
                      ================================= */}

                  <DeviceDiagnosticSection
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

                  {/* =================================
                      DADOS TÉCNICOS DOS SENSORES
                      ================================= */}

                  <ModalSection
                    title="Dados técnicos dos sensores"
                    description="Valores brutos utilizados pelo equipamento para monitoramento e diagnóstico."
                  >
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
                      helper="Valor de calibração da máquina ligada."
                    />

                    <DetailItem
                      label="Referência desligado (OFF)"
                      value={formatCounter(
                        device.variables
                          ?.OFF,
                      )}
                      helper="Valor de calibração da máquina desligada."
                    />

                    <DetailItem
                      label="WM"
                      value={formatCounter(
                        device.variables
                          ?.WM,
                      )}
                      helper="Valor bruto relacionado à lógica de ausência de movimento."
                    />
                  </ModalSection>
                </div>

                {/* =================================
                    CONTROLE
                    ================================= */}

                <aside className="lg:sticky lg:top-6 lg:self-start">
                  <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl xl:p-7">
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Controle rápido
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-slate-900">
                        Controle do equipamento
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        Ajuste o funcionamento do ar-condicionado sem precisar rolar até o fim.
                      </p>
                    </div>

                    <DeviceControl
                      device={
                        device
                      }
                    />
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

function DeviceDiagnosticSection({
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
    <section
      className={`rounded-3xl border p-5 shadow-sm backdrop-blur-xl sm:p-6 ${
        divergent
          ? "border-amber-200/80 bg-amber-50/70"
          : "border-white/50 bg-white/70"
      }`}
    >
      <div className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Diagnóstico do equipamento
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Estado informado pelo
              Brise, estado físico
              detectado e informações
              do sensor de movimento.
            </p>
          </div>

          <DiagnosticBadge
            available={
              hasCompleteDiagnostic
            }
            divergent={
              divergent
            }
          />
        </div>
      </div>

      {/* ESTADOS */}

      <div className="grid gap-3 sm:grid-cols-3">
        <DiagnosticStateCard
          label="Estado informado"
          value={formatDetectedState(
            logicalState,
          )}
          helper="Estado informado pelo Brise"
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                : `WM = ${wm}. Este valor ainda não foi mapeado.`
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
              ? "O Brise informou o equipamento desligado após ausência de movimento."
              : shutdownReason ===
                  "device_on"
                ? "O equipamento continua informado como ligado."
                : "Não foi possível identificar o motivo do desligamento."
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

      <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
        <p className="text-xs leading-5 text-slate-500">
          O estado físico é
          determinado comparando a
          leitura ACC com as
          referências ON e OFF. A
          referência mais próxima
          indica o estado detectado
          da máquina.
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Para o sensor de movimento,
          atualmente apenas{" "}
          <strong>
            WM = 0
          </strong>{" "}
          possui interpretação
          confirmada: ausência de
          movimento. Outros valores
          permanecem sem
          classificação até serem
          identificados.
        </p>
      </div>
    </section>
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
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        <span className="h-2 w-2 rounded-full bg-slate-400" />

        Diagnóstico incompleto
      </span>
    );
  }

  if (divergent) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />

        Divergência detectada
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />

      Estados compatíveis
    </span>
  );
}

/* ==========================================
   CARD DE ESTADO
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
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${indicatorClass}`}
        />

        <p className="font-semibold text-slate-900">
          {value}
        </p>
      </div>

      <p className="mt-1 text-xs text-slate-500">
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
    "Dados insuficientes para comparação.";

  let indicatorClass =
    "bg-slate-400";

  if (available) {
    if (divergent) {
      value =
        "Divergência";

      helper =
        "O estado físico não corresponde ao estado informado.";

      indicatorClass =
        "bg-amber-500";
    } else {
      value =
        "Normal";

      helper =
        "Os dois estados são compatíveis.";

      indicatorClass =
        "bg-emerald-500";
    }
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Situação
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${indicatorClass}`}
        />

        <p className="font-semibold text-slate-900">
          {value}
        </p>
      </div>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {helper}
      </p>
    </div>
  );
}

/* ==========================================
   MOVIMENTO / AUSÊNCIA
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
      className={`rounded-2xl border p-4 ${
        warning
          ? "border-amber-200 bg-amber-50/70"
          : "border-white/60 bg-white/70"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            warning
              ? "bg-amber-500"
              : "bg-slate-400"
          }`}
        />

        <p
          className={`font-semibold ${
            warning
              ? "text-amber-900"
              : "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>

      <p
        className={`mt-1 text-xs leading-5 ${
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
   DISTÂNCIA DO ACELERÔMETRO
   ========================================== */

function DiagnosticDistance({
  label,
  value,
}: {
  label: string;

  value: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50/70 px-4 py-3">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="font-mono text-sm font-semibold text-slate-700">
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
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-amber-200/70 bg-white/70 p-8 text-center shadow-sm backdrop-blur-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 shadow-sm">
        <span className="h-3 w-3 rounded-full bg-amber-500" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Dispositivo sem resposta
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        Não foi possível obter os
        dados atuais do equipamento.
        Ele pode estar desligado,
        offline ou com credenciais
        inválidas.
      </p>
    </div>
  );
}

/* ==========================================
   SEÇÃO PADRÃO
   ========================================== */

function ModalSection({
  title,
  description,
  children,
}: {
  title: string;

  description?: string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
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

function PrimaryMetric({
  label,
  value,
  helper,
}: {
  label: string;

  value: string;

  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
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
    <div className="rounded-2xl border border-white/40 bg-slate-50/70 p-4 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 font-semibold text-slate-800">
        {value}
      </p>

      {helper && (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {helper}
        </p>
      )}
    </div>
  );
}

/* ==========================================
   FORMATADORES LOCAIS
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