"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  GroupedSchedule,
  ScheduleListResponse,
} from "@/types/schedule";

import {
  WEEK_DAYS,
} from "@/constants/schedule";

import {
  decodeWeekDays,
} from "@/utils/schedule";

import {
  getSchedules,
} from "@/services/schedule.service";

interface DeviceSchedulesProps {
  deviceId: number;

  /*
   * Deixamos as ações opcionais
   * por enquanto.
   *
   * No próximo passo vamos
   * conectá-las ao modal.
   */
  onCreate?: () => void;

  onManage?: () => void;
}

export function DeviceSchedules({
  deviceId,
  onCreate,
  onManage,
}: DeviceSchedulesProps) {
  const [
    data,
    setData,
  ] =
    useState<ScheduleListResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadSchedules();
  }, [deviceId]);

  async function loadSchedules() {
    try {
      setLoading(true);

      setError("");

      const result =
        await getSchedules();

      setData(
        result,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao carregar agendamentos.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Filtra somente os agendamentos
   * associados ao equipamento
   * atualmente aberto.
   */
  const deviceSchedules =
    useMemo(() => {
      if (!data) {
        return [];
      }

      return data.schedules
        .filter(
          (schedule) =>
            Array.isArray(
              schedule.deviceIds,
            ) &&
            schedule.deviceIds.includes(
              deviceId,
            ),
        )
        .sort(
          (
            a,
            b,
          ) => {
            /*
             * Ativos primeiro.
             */
            if (
              a.enable !==
              b.enable
            ) {
              return a.enable
                ? -1
                : 1;
            }

            /*
             * Depois, ordena pelo
             * horário inicial.
             */
            return (
              (a.dateStart ?? 0) -
              (b.dateStart ?? 0)
            );
          },
        );
    }, [
      data,
      deviceId,
    ]);

  const activeCount =
    deviceSchedules.filter(
      (schedule) =>
        schedule.enable ===
        true,
    ).length;

  /*
   * Para não deixar o modal
   * gigantesco, mostramos até
   * quatro programações.
   */
  const visibleSchedules =
    deviceSchedules.slice(
      0,
      4,
    );

  const remainingCount =
    Math.max(
      0,
      deviceSchedules.length -
        visibleSchedules.length,
    );

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/75 shadow-sm backdrop-blur-xl">
      {/* LINHA SUPERIOR */}

      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400" />

      {/* ======================================
          CABEÇALHO
          ====================================== */}

      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <CalendarIcon />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-950">
                Agendamentos
              </h3>

              {!loading &&
                !error &&
                deviceSchedules.length >
                  0 && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    {
                      deviceSchedules.length
                    }{" "}
                    {deviceSchedules.length ===
                    1
                      ? "programação"
                      : "programações"}
                  </span>
                )}
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Programações associadas
              a este equipamento.
            </p>
          </div>
        </div>

        {!loading &&
          !error &&
          deviceSchedules.length >
            0 && (
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                {activeCount}{" "}
                {activeCount === 1
                  ? "ativo"
                  : "ativos"}
              </span>
            </div>
          )}
      </div>

      {/* ======================================
          CONTEÚDO
          ====================================== */}

      <div className="p-5">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={
              error
            }
            onRetry={
              loadSchedules
            }
          />
        ) : deviceSchedules.length ===
          0 ? (
          <EmptyState
            onCreate={
              onCreate
            }
          />
        ) : (
          <>
            {/* LISTA */}

            <div className="space-y-3">
              {visibleSchedules.map(
                (
                  schedule,
                  index,
                ) => (
                  <ScheduleItem
                    key={`${schedule.scheduleId}-${index}`}
                    schedule={
                      schedule
                    }
                  />
                ),
              )}
            </div>

            {/* MAIS AGENDAMENTOS */}

            {remainingCount >
              0 && (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/65 px-4 py-3 text-center">
                <p className="text-xs font-medium text-slate-500">
                  +{" "}
                  {
                    remainingCount
                  }{" "}
                  {remainingCount ===
                  1
                    ? "outro agendamento"
                    : "outros agendamentos"}{" "}
                  associado
                  {remainingCount ===
                  1
                    ? ""
                    : "s"}{" "}
                  a este equipamento.
                </p>
              </div>
            )}

            {/* AÇÕES */}

            {(onCreate ||
              onManage) && (
              <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                {onCreate && (
                  <button
                    type="button"
                    onClick={
                      onCreate
                    }
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    <PlusIcon />

                    Novo agendamento
                  </button>
                )}

                {onManage && (
                  <button
                    type="button"
                    onClick={
                      onManage
                    }
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <SettingsIcon />

                    Gerenciar todos
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ==========================================
   ITEM
   ========================================== */

function ScheduleItem({
  schedule,
}: {
  schedule: GroupedSchedule;
}) {
  const valid =
    isScheduleValid(
      schedule,
    );

  const visualState =
    !valid
      ? "invalid"
      : schedule.enable
        ? "active"
        : "inactive";

  const styles = {
    active: {
      card:
        "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/45",

      icon:
        "bg-emerald-50 text-emerald-700",

      badge:
        "border-emerald-100 bg-emerald-50 text-emerald-700",

      dot:
        "bg-emerald-500",
    },

    inactive: {
      card:
        "border-slate-200 bg-gradient-to-br from-white to-slate-50/70",

      icon:
        "bg-slate-100 text-slate-600",

      badge:
        "border-slate-200 bg-slate-100 text-slate-600",

      dot:
        "bg-slate-400",
    },

    invalid: {
      card:
        "border-amber-200 bg-gradient-to-br from-white to-amber-50/60",

      icon:
        "bg-amber-50 text-amber-700",

      badge:
        "border-amber-200 bg-amber-50 text-amber-700",

      dot:
        "bg-amber-500",
    },
  };

  const current =
    styles[visualState];

  const name =
    typeof schedule.name ===
      "string" &&
    schedule.name
      .trim()
      .length > 0
      ? schedule.name.trim()
      : "Agendamento sem nome";

  const days =
    getScheduleDays(
      schedule,
    );

  const startTime =
    formatScheduleTime(
      schedule.dateStart,
    );

  const endTime =
    formatScheduleTime(
      schedule.dateEnd,
    );

  const temperature =
    formatTemperature(
      schedule.parameter
        ?.setpointCool,
    );

  const fan =
    formatFanSpeed(
      schedule.parameter
        ?.fanSpeed,
    );

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-4 transition duration-200 hover:shadow-sm ${current.card}`}
    >
      <div className="flex items-start gap-3">
        {/* ÍCONE */}

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          <ClockIcon />
        </div>

        {/* CONTEÚDO */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {name}
              </p>

              <p className="mt-0.5 font-mono text-[9px] font-semibold text-slate-400">
                ID{" "}
                {
                  schedule.scheduleId
                }
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.07em] ${current.badge}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${current.dot}`}
              />

              {!valid
                ? "Incompleto"
                : schedule.enable
                  ? "Ativo"
                  : "Inativo"}
            </span>
          </div>

          {/* HORÁRIO E DIAS */}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <ClockSmallIcon />

              <span>
                {startTime}
              </span>

              <ArrowSmallIcon />

              <span>
                {endTime}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
              <RepeatIcon />

              <span className="truncate">
                {days}
              </span>
            </div>
          </div>

          {/* PARÂMETROS */}

          <div className="mt-3 flex flex-wrap gap-2">
            <ParameterChip
              icon={
                <TemperatureIcon />
              }
              label={
                temperature
              }
              tone="blue"
            />

            <ParameterChip
              icon={
                <FanIcon />
              }
              label={
                fan
              }
              tone="cyan"
            />

            <ParameterChip
              icon={
                <ModeIcon />
              }
              label={formatMode(
                schedule,
              )}
              tone="slate"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   CHIP
   ========================================== */

function ParameterChip({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;

  label: string;

  tone:
    | "blue"
    | "cyan"
    | "slate";
}) {
  const styles = {
    blue:
      "border-blue-100 bg-blue-50 text-blue-700",

    cyan:
      "border-cyan-100 bg-cyan-50 text-cyan-700",

    slate:
      "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${styles[tone]}`}
    >
      {icon}

      {label}
    </span>
  );
}

/* ==========================================
   CARREGANDO
   ========================================== */

function LoadingState() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <LoadingIcon />
      </div>

      <div>
        <p className="text-xs font-bold text-slate-800">
          Carregando agendamentos
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          Consultando programações
          associadas ao equipamento.
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   ERRO
   ========================================== */

function ErrorState({
  message,
  onRetry,
}: {
  message: string;

  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <WarningIcon />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-red-900">
            Não foi possível carregar
            os agendamentos
          </p>

          <p className="mt-1 text-[10px] leading-5 text-red-700">
            {message}
          </p>

          <button
            type="button"
            onClick={
              onRetry
            }
            className="mt-3 inline-flex h-8 items-center gap-2 rounded-lg bg-red-100 px-3 text-[10px] font-bold text-red-800 transition hover:bg-red-200"
          >
            <RefreshIcon />

            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   VAZIO
   ========================================== */

function EmptyState({
  onCreate,
}: {
  onCreate?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/55 px-5 py-7 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
        <CalendarIcon />
      </div>

      <p className="mt-3 text-sm font-bold text-slate-900">
        Nenhum agendamento
        configurado
      </p>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
        Este equipamento ainda
        não possui uma programação
        automática associada.
      </p>

      {onCreate && (
        <button
          type="button"
          onClick={
            onCreate
          }
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          <PlusIcon />

          Criar primeiro agendamento
        </button>
      )}
    </div>
  );
}

/* ==========================================
   VALIDAÇÃO
   ========================================== */

function isScheduleValid(
  schedule: GroupedSchedule,
) {
  return (
    Number.isInteger(
      schedule.scheduleId,
    ) &&
    schedule.scheduleId >
      0 &&
    typeof schedule.name ===
      "string" &&
    schedule.name
      .trim()
      .length > 0 &&
    isValidTimestamp(
      schedule.dateStart,
    ) &&
    isValidTimestamp(
      schedule.dateEnd,
    ) &&
    schedule.dateEnd >
      schedule.dateStart &&
    schedule.parameter !==
      undefined &&
    schedule.parameter !==
      null
  );
}

function isValidTimestamp(
  value?: number | null,
) {
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(
      value,
    ) ||
    value <= 0
  ) {
    return false;
  }

  const date =
    new Date(
      value * 1000,
    );

  return !Number.isNaN(
    date.getTime(),
  );
}

/* ==========================================
   DIAS
   ========================================== */

function getScheduleDays(
  schedule: GroupedSchedule,
) {
  if (
    !Number.isFinite(
      schedule.repetitionValue,
    )
  ) {
    return "Indisponível";
  }

  try {
    const values =
      decodeWeekDays(
        schedule.repetitionValue,
      );

    const labels =
      WEEK_DAYS
        .filter(
          (day) =>
            values.includes(
              day.value,
            ),
        )
        .map(
          (day) =>
            day.shortLabel,
        );

    if (
      labels.length === 0
    ) {
      return "Sem repetição";
    }

    return labels.join(
      " • ",
    );
  } catch {
    return "Indisponível";
  }
}

/* ==========================================
   FORMATADORES
   ========================================== */

function formatScheduleTime(
  timestamp?: number | null,
) {
  if (
    !isValidTimestamp(
      timestamp,
    )
  ) {
    return "--:--";
  }

  try {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        hour:
          "2-digit",

        minute:
          "2-digit",

        timeZone:
          "America/Fortaleza",
      },
    ).format(
      new Date(
        timestamp! *
          1000,
      ),
    );
  } catch {
    return "--:--";
  }
}

function formatTemperature(
  value?: number | null,
) {
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(
      value,
    )
  ) {
    return "Indisponível";
  }

  if (value === 0) {
    return "Desligado";
  }

  if (
    value < 18 ||
    value > 28
  ) {
    return "Indisponível";
  }

  return `${value} °C`;
}

function formatFanSpeed(
  value?: number | null,
) {
  const speeds: Record<
    number,
    string
  > = {
    1: "Baixa",
    2: "Média",
    3: "Alta",
  };

  if (
    value === undefined ||
    value === null
  ) {
    return "Indisponível";
  }

  return (
    speeds[value] ??
    "Indisponível"
  );
}

function formatMode(
  schedule: GroupedSchedule,
) {
  const parameters =
    schedule.parameter;

  if (!parameters) {
    return "Indisponível";
  }

  if (
    parameters.modeDevice ===
    3
  ) {
    return "Eco";
  }

  const modes: Record<
    number,
    string
  > = {
    0: "Frio",
    1: "Quente",
    2: "Automático",
    3: "Ventilar",
  };

  return (
    modes[
      parameters.modeAC
    ] ??
    "Indisponível"
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function IconBase({
  children,
  className = "h-4 w-4",
}: {
  children: ReactNode;

  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CalendarIcon() {
  return (
    <IconBase>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M16 3v4" />

      <path d="M8 3v4" />

      <path d="M3 10h18" />
    </IconBase>
  );
}

function ClockIcon() {
  return (
    <IconBase>
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4l3 2" />
    </IconBase>
  );
}

function ClockSmallIcon() {
  return (
    <IconBase className="h-3.5 w-3.5 text-blue-500">
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4l3 2" />
    </IconBase>
  );
}

function ArrowSmallIcon() {
  return (
    <IconBase className="h-3 w-3 text-slate-300">
      <path d="M5 12h14" />

      <path d="m15 8 4 4-4 4" />
    </IconBase>
  );
}

function RepeatIcon() {
  return (
    <IconBase className="h-3.5 w-3.5 text-slate-400">
      <path d="m17 1 4 4-4 4" />

      <path d="M3 11V9a4 4 0 0 1 4-4h14" />

      <path d="m7 23-4-4 4-4" />

      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </IconBase>
  );
}

function TemperatureIcon() {
  return (
    <IconBase className="h-3 w-3">
      <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z" />
    </IconBase>
  );
}

function FanIcon() {
  return (
    <IconBase className="h-3 w-3">
      <circle
        cx="12"
        cy="12"
        r="2"
      />

      <path d="M12 10c-1-4 1-7 4-7 2 0 3 2 2 4-1 2-3 3-6 3" />

      <path d="M14 12c4-1 7 1 7 4 0 2-2 3-4 2-2-1-3-3-3-6" />

      <path d="M12 14c1 4-1 7-4 7-2 0-3-2-2-4 1-2 3-3 6-3" />

      <path d="M10 12c-4 1-7-1-7-4 0-2 2-3 4-2 2 1 3 3 3 6" />
    </IconBase>
  );
}

function ModeIcon() {
  return (
    <IconBase className="h-3 w-3">
      <path d="M12 2v20" />

      <path d="M4.2 6.5l15.6 11" />

      <path d="M19.8 6.5l-15.6 11" />
    </IconBase>
  );
}

function PlusIcon() {
  return (
    <IconBase>
      <path d="M12 5v14" />

      <path d="M5 12h14" />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
      <circle
        cx="12"
        cy="12"
        r="3"
      />

      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </IconBase>
  );
}

function RefreshIcon() {
  return (
    <IconBase>
      <path d="M20 11a8 8 0 0 0-14.9-4" />

      <path d="M4 4v5h5" />

      <path d="M4 13a8 8 0 0 0 14.9 4" />

      <path d="M20 20v-5h-5" />
    </IconBase>
  );
}

function WarningIcon() {
  return (
    <IconBase>
      <path d="M12 9v4" />

      <path d="M12 17h.01" />

      <path d="M10.3 3.6 2.4 17.3A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.7L13.7 3.6a2 2 0 0 0-3.4 0Z" />
    </IconBase>
  );
}

function LoadingIcon() {
  return (
    <IconBase className="h-4 w-4 animate-spin">
      <path d="M21 12a9 9 0 1 1-9-9" />
    </IconBase>
  );
}