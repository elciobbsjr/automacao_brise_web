"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  DashboardDevice,
} from "@/types/dashboard";

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

import {
  ScheduleDeleteModal,
} from "./ScheduleDeleteModal";

import {
  ScheduleToggleModal,
} from "./ScheduleToggleModal";

import {
  ScheduleEditModal,
} from "./ScheduleEditModal";

interface ScheduleListProps {
  devices: DashboardDevice[];
}

export function ScheduleList({
  devices,
}: ScheduleListProps) {
  const [
    scheduleToToggle,
    setScheduleToToggle,
  ] =
    useState<GroupedSchedule | null>(
      null,
    );

  const [
    scheduleToDelete,
    setScheduleToDelete,
  ] =
    useState<GroupedSchedule | null>(
      null,
    );

  const [
    scheduleToEdit,
    setScheduleToEdit,
  ] =
    useState<GroupedSchedule | null>(
      null,
    );

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
  }, []);

  async function loadSchedules() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getSchedules();

      setData(result);
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

  /* ==========================================
     CARREGANDO
     ========================================== */

  if (loading) {
    return (
      <ScheduleLoadingState />
    );
  }

  /* ==========================================
     ERRO
     ========================================== */

  if (error) {
    return (
      <ScheduleErrorState
        message={error}
        onRetry={
          loadSchedules
        }
      />
    );
  }

  /* ==========================================
     VAZIO
     ========================================== */

  if (
    !data ||
    data.schedules.length === 0
  ) {
    return (
      <ScheduleEmptyState />
    );
  }

  /* ==========================================
     RESUMO
     ========================================== */

  const activeSchedules =
    data.schedules.filter(
      (schedule) =>
        isScheduleValid(
          schedule,
        ) &&
        schedule.enable ===
          true,
    ).length;

  const inactiveSchedules =
    data.schedules.filter(
      (schedule) =>
        isScheduleValid(
          schedule,
        ) &&
        schedule.enable !==
          true,
    ).length;

  const incompleteSchedules =
    data.schedules.filter(
      (schedule) =>
        !isScheduleValid(
          schedule,
        ),
    ).length;

  return (
    <section>
      {/* ==========================================
          CABEÇALHO DA LISTA
          ========================================== */}

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />

            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
              Programações cadastradas
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Consulte e gerencie os
            horários configurados para
            os equipamentos.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadSchedules
          }
          className="group flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <RefreshIcon />

          Atualizar
        </button>
      </div>

      {/* ==========================================
          INDICADORES
          ========================================== */}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ScheduleSummary
          label="Total"
          value={
            data.totalSchedules
          }
          tone="blue"
          icon={
            <CalendarIcon />
          }
        />

        <ScheduleSummary
          label="Ativos"
          value={
            activeSchedules
          }
          tone="green"
          icon={
            <ActiveIcon />
          }
        />

        <ScheduleSummary
          label="Inativos"
          value={
            inactiveSchedules
          }
          tone="slate"
          icon={
            <PauseIcon />
          }
        />

        <ScheduleSummary
          label="Incompletos"
          value={
            incompleteSchedules
          }
          tone={
            incompleteSchedules >
            0
              ? "amber"
              : "slate"
          }
          icon={
            <WarningIcon />
          }
        />
      </div>

      {/* ==========================================
          LISTA
          ========================================== */}

      <div className="grid gap-4">
        {data.schedules.map(
          (
            schedule,
            index,
          ) => (
            <ScheduleCard
              key={`${schedule.scheduleId}-${index}`}
              schedule={
                schedule
              }
              devices={
                devices
              }
              onEdit={() =>
                setScheduleToEdit(
                  schedule,
                )
              }
              onDelete={() =>
                setScheduleToDelete(
                  schedule,
                )
              }
              onToggle={() =>
                setScheduleToToggle(
                  schedule,
                )
              }
            />
          ),
        )}
      </div>

      {/* ==========================================
          MODAIS
          ========================================== */}

      <ScheduleDeleteModal
        schedule={
          scheduleToDelete
        }
        open={
          scheduleToDelete !==
          null
        }
        onClose={() =>
          setScheduleToDelete(
            null,
          )
        }
        onDeleted={() => {
          setScheduleToDelete(
            null,
          );

          loadSchedules();
        }}
      />

      <ScheduleToggleModal
        schedule={
          scheduleToToggle
        }
        open={
          scheduleToToggle !==
          null
        }
        onClose={() =>
          setScheduleToToggle(
            null,
          )
        }
        onUpdated={() => {
          setScheduleToToggle(
            null,
          );

          loadSchedules();
        }}
      />

      <ScheduleEditModal
        schedule={
          scheduleToEdit
        }
        devices={
          devices
        }
        open={
          scheduleToEdit !==
          null
        }
        onClose={() =>
          setScheduleToEdit(
            null,
          )
        }
        onUpdated={() => {
          setScheduleToEdit(
            null,
          );

          loadSchedules();
        }}
      />
    </section>
  );
}

/* ==========================================
   CARD DO AGENDAMENTO
   ========================================== */

function ScheduleCard({
  schedule,
  devices,
  onEdit,
  onDelete,
  onToggle,
}: {
  schedule: GroupedSchedule;

  devices: DashboardDevice[];

  onEdit: () => void;

  onDelete: () => void;

  onToggle: () => void;
}) {
  const valid =
    isScheduleValid(
      schedule,
    );

  const selectedDays =
    getSelectedDays(
      schedule,
    );

  const dayLabels =
    WEEK_DAYS
      .filter((day) =>
        selectedDays.includes(
          day.value,
        ),
      )
      .map(
        (day) =>
          day.shortLabel,
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
    schedule.parameter
      ?.setpointCool;

  const associatedDevices =
    getAssociatedDevices(
      schedule,
      devices,
    );

  const name =
    isValidScheduleName(
      schedule.name,
    )
      ? schedule.name!.trim()
      : "Agendamento sem nome";

  const scheduleMode =
    formatScheduleMode(
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
        "border-emerald-100/90 bg-gradient-to-br from-white via-white to-emerald-50/35",

      accent:
        "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400",

      icon:
        "border-emerald-100 bg-emerald-50 text-emerald-700",

      status:
        "border-emerald-100 bg-emerald-50 text-emerald-700",

      dot:
        "bg-emerald-500",
    },

    inactive: {
      card:
        "border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/70",

      accent:
        "bg-gradient-to-r from-slate-500 via-slate-400 to-slate-300",

      icon:
        "border-slate-200 bg-slate-100 text-slate-600",

      status:
        "border-slate-200 bg-slate-100 text-slate-600",

      dot:
        "bg-slate-400",
    },

    invalid: {
      card:
        "border-amber-200/90 bg-gradient-to-br from-white via-amber-50/35 to-orange-50/50",

      accent:
        "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300",

      icon:
        "border-amber-200 bg-amber-50 text-amber-700",

      status:
        "border-amber-200 bg-amber-100 text-amber-700",

      dot:
        "bg-amber-500",
    },
  };

  const current =
    styles[visualState];

  return (
    <article
      className={`relative overflow-hidden rounded-[24px] border shadow-[0_8px_28px_rgba(15,23,42,0.055)] transition duration-200 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)] ${current.card}`}
    >
      {/* LINHA DE ESTADO */}

      <div
        className={`absolute inset-x-0 top-0 h-[3px] ${current.accent}`}
      />

      <div className="p-5 sm:p-6">
        {/* ======================================
            CABEÇALHO
            ====================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm ${current.icon}`}
            >
              <ClockIcon />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-lg font-bold tracking-tight text-slate-950">
                  {name}
                </h4>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.07em] ${current.status}`}
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

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span>
                  ID{" "}
                  <span className="font-mono font-semibold text-slate-500">
                    {Number.isFinite(
                      schedule.scheduleId,
                    )
                      ? schedule.scheduleId
                      : "indisponível"}
                  </span>
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                <span>
                  {Array.isArray(
                    schedule.deviceIds,
                  )
                    ? schedule
                        .deviceIds
                        .length
                    : 0}{" "}
                  {schedule.deviceIds
                      ?.length === 1
                    ? "equipamento"
                    : "equipamentos"}
                </span>
              </div>
            </div>
          </div>

          {/* AÇÕES DESKTOP */}

          <div className="flex flex-wrap gap-2">
            <ActionButton
              label="Editar"
              icon={
                <EditIcon />
              }
              onClick={
                onEdit
              }
              disabled={
                !valid
              }
              title={
                valid
                  ? "Editar agendamento"
                  : "Agendamentos incompletos não podem ser editados."
              }
            />

            <ActionButton
              label={
                schedule.enable
                  ? "Desativar"
                  : "Ativar"
              }
              icon={
                schedule.enable
                  ? <PauseIcon />
                  : <PlayIcon />
              }
              tone={
                schedule.enable
                  ? "slate"
                  : "green"
              }
              onClick={
                onToggle
              }
              disabled={
                !valid
              }
              title={
                valid
                  ? schedule.enable
                    ? "Desativar agendamento"
                    : "Ativar agendamento"
                  : "Agendamentos incompletos não podem ser ativados ou desativados."
              }
            />

            <ActionButton
              label="Excluir"
              icon={
                <TrashIcon />
              }
              tone="red"
              onClick={
                onDelete
              }
              disabled={
                !hasValidDeleteData(
                  schedule,
                )
              }
              title={
                hasValidDeleteData(
                  schedule,
                )
                  ? "Excluir agendamento"
                  : "Não há informações suficientes para excluir este agendamento."
              }
            />
          </div>
        </div>

        {/* ======================================
            AVISO DE INCOMPLETO
            ====================================== */}

        {!valid && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <WarningIcon />
            </div>

            <div>
              <p className="text-xs font-bold text-amber-900">
                Dados incompletos
              </p>

              <p className="mt-1 text-[11px] leading-5 text-amber-700">
                Algumas informações
                não foram retornadas
                corretamente. Para evitar
                alterações incorretas,
                edição e ativação estão
                bloqueadas.
              </p>
            </div>
          </div>
        )}

        {/* ======================================
            HORÁRIO E DIAS
            ====================================== */}

        <div className="mt-5 grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
          {/* HORÁRIO */}

          <div className="rounded-2xl border border-blue-100/80 bg-blue-50/45 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100/80 text-blue-700">
                <ClockSmallIcon />
              </div>

              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-700">
                Horário
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-950">
                {startTime}
              </span>

              <ArrowIcon />

              <span className="text-xl font-bold tracking-tight text-slate-950">
                {endTime}
              </span>
            </div>
          </div>

          {/* DIAS */}

          <div className="rounded-2xl border border-slate-200/70 bg-white/65 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Repetição
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {dayLabels.length >
              0 ? (
                dayLabels.map(
                  (day) => (
                    <span
                      key={
                        day
                      }
                      className="inline-flex h-7 min-w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-2 text-[10px] font-bold uppercase text-blue-700"
                    >
                      {day}
                    </span>
                  ),
                )
              ) : (
                <span className="text-sm font-semibold text-slate-600">
                  {valid
                    ? "Sem repetição"
                    : "Indisponível"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ======================================
            PARÂMETROS
            ====================================== */}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ScheduleParameter
            label="Modo"
            value={
              scheduleMode
            }
            icon={
              <ModeIcon />
            }
            tone="blue"
          />

          <ScheduleParameter
            label="Temperatura"
            value={formatTemperature(
              temperature,
            )}
            icon={
              <TemperatureIcon />
            }
            tone="cyan"
          />

          <ScheduleParameter
            label="Ventilação"
            value={formatFanSpeed(
              schedule.parameter
                ?.fanSpeed,
            )}
            icon={
              <FanIcon />
            }
            tone="indigo"
          />
        </div>

        {/* ======================================
            DISPOSITIVOS ASSOCIADOS
            ====================================== */}

        <div className="mt-4 border-t border-slate-200/70 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <EquipmentIcon />

                <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-slate-400">
                  Equipamentos associados
                </p>
              </div>

              <p className="mt-1 text-[11px] text-slate-400">
                Dispositivos que receberão
                esta programação.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              {associatedDevices.length}{" "}
              {associatedDevices.length ===
              1
                ? "equipamento"
                : "equipamentos"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {associatedDevices.length >
            0 ? (
              <>
                {associatedDevices
                  .slice(
                    0,
                    6,
                  )
                  .map(
                    (
                      device,
                    ) => (
                      <DeviceChip
                        key={
                          device.deviceId
                        }
                        device={
                          device
                        }
                      />
                    ),
                  )}

                {associatedDevices.length >
                  6 && (
                  <span className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-500">
                    +
                    {associatedDevices.length -
                      6}{" "}
                    outros
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-500">
                Nenhum equipamento
                associado.
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   RESUMO
   ========================================== */

type SummaryTone =
  | "blue"
  | "green"
  | "slate"
  | "amber";

function ScheduleSummary({
  label,
  value,
  tone,
  icon,
}: {
  label: string;

  value: number;

  tone: SummaryTone;

  icon: ReactNode;
}) {
  const styles = {
    blue: {
      box:
        "border-blue-100 bg-blue-50/55",

      icon:
        "bg-blue-100 text-blue-700",

      value:
        "text-blue-950",
    },

    green: {
      box:
        "border-emerald-100 bg-emerald-50/55",

      icon:
        "bg-emerald-100 text-emerald-700",

      value:
        "text-emerald-950",
    },

    slate: {
      box:
        "border-slate-200 bg-slate-100/70",

      icon:
        "bg-white text-slate-500",

      value:
        "text-slate-900",
    },

    amber: {
      box:
        "border-amber-200 bg-amber-50/70",

      icon:
        "bg-amber-100 text-amber-700",

      value:
        "text-amber-950",
    },
  };

  const current =
    styles[tone];

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3.5 ${current.box}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
      >
        {icon}
      </div>

      <div>
        <p
          className={`text-xl font-bold tracking-tight ${current.value}`}
        >
          {value}
        </p>

        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   PARÂMETRO
   ========================================== */

type ParameterTone =
  | "blue"
  | "cyan"
  | "indigo";

function ScheduleParameter({
  label,
  value,
  icon,
  tone,
}: {
  label: string;

  value: string;

  icon: ReactNode;

  tone: ParameterTone;
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-700",

    cyan:
      "bg-cyan-50 text-cyan-700",

    indigo:
      "bg-indigo-50 text-indigo-700",
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3.5">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles[tone]}`}
        >
          {icon}
        </div>

        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ==========================================
   DISPOSITIVO ASSOCIADO
   ========================================== */

function DeviceChip({
  device,
}: {
  device: DashboardDevice;
}) {
  const name =
    device.config?.name ||
    `Nº ${device.deviceId}`;

  return (
    <span className="inline-flex h-8 max-w-[210px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 shadow-sm">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          device.online
            ? "bg-emerald-500"
            : "bg-amber-500"
        }`}
      />

      <span className="truncate">
        {name}
      </span>

      <span className="font-mono text-[9px] text-slate-400">
        {device.deviceId}
      </span>
    </span>
  );
}

/* ==========================================
   AÇÃO
   ========================================== */

type ActionTone =
  | "default"
  | "green"
  | "slate"
  | "red";

function ActionButton({
  label,
  icon,
  tone = "default",
  onClick,
  disabled,
  title,
}: {
  label: string;

  icon: ReactNode;

  tone?: ActionTone;

  onClick: () => void;

  disabled?: boolean;

  title?: string;
}) {
  const styles = {
    default:
      "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",

    green:
      "border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100",

    slate:
      "border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-200",

    red:
      "border-red-100 bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      title={
        title
      }
      className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[tone]}`}
    >
      {icon}

      {label}
    </button>
  );
}

/* ==========================================
   CARREGAMENTO
   ========================================== */

function ScheduleLoadingState() {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white/75 p-8 shadow-sm">
      <div className="flex items-center justify-center gap-3">
        <LoadingIcon />

        <div>
          <p className="text-sm font-bold text-slate-800">
            Carregando agendamentos
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            Aguarde enquanto consultamos
            as programações.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   ERRO
   ========================================== */

function ScheduleErrorState({
  message,
  onRetry,
}: {
  message: string;

  onRetry: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-red-200 bg-gradient-to-br from-white to-red-50/60 p-7 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <WarningIcon />
        </div>

        <div className="flex-1">
          <p className="font-bold text-red-900">
            Não foi possível carregar
            os agendamentos
          </p>

          <p className="mt-1 text-sm leading-6 text-red-700">
            {message}
          </p>

          <button
            type="button"
            onClick={
              onRetry
            }
            className="mt-4 flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
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

function ScheduleEmptyState() {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/65 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <CalendarIcon />
      </div>

      <p className="mt-4 font-bold text-slate-900">
        Nenhum agendamento cadastrado
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
        Use a aba{" "}
        <strong className="font-semibold text-slate-700">
          Novo agendamento
        </strong>{" "}
        para criar a primeira
        programação dos equipamentos.
      </p>
    </div>
  );
}

/* ==========================================
   ASSOCIAÇÃO DOS DISPOSITIVOS
   ========================================== */

function getAssociatedDevices(
  schedule: GroupedSchedule,
  devices: DashboardDevice[],
) {
  if (
    !Array.isArray(
      schedule.deviceIds,
    )
  ) {
    return [];
  }

  return schedule.deviceIds.map(
    (deviceId) => {
      const device =
        devices.find(
          (item) =>
            item.deviceId ===
            deviceId,
        );

      if (device) {
        return device;
      }

      return {
        deviceId,
        online: false,
        config: null,
        variables: null,
        parameters: null,
      } as DashboardDevice;
    },
  );
}

/* ==========================================
   VALIDAÇÃO
   ========================================== */

function isScheduleValid(
  schedule: GroupedSchedule,
) {
  if (
    !Number.isInteger(
      schedule.scheduleId,
    ) ||
    schedule.scheduleId <= 0
  ) {
    return false;
  }

  if (
    !isValidScheduleName(
      schedule.name,
    )
  ) {
    return false;
  }

  if (
    !isValidTimestamp(
      schedule.dateStart,
    ) ||
    !isValidTimestamp(
      schedule.dateEnd,
    )
  ) {
    return false;
  }

  if (
    schedule.dateEnd <=
    schedule.dateStart
  ) {
    return false;
  }

  if (
    !Array.isArray(
      schedule.deviceIds,
    ) ||
    schedule.deviceIds.length ===
      0
  ) {
    return false;
  }

  if (
    !schedule.parameter
  ) {
    return false;
  }

  const fanSpeed =
    schedule.parameter.fanSpeed;

  if (
    !Number.isFinite(
      fanSpeed,
    ) ||
    fanSpeed < 1 ||
    fanSpeed > 3
  ) {
    return false;
  }

  const setpointCool =
    schedule.parameter
      .setpointCool;

  if (
    !Number.isFinite(
      setpointCool,
    )
  ) {
    return false;
  }

  if (
    setpointCool !== 0 &&
    (
      setpointCool < 18 ||
      setpointCool > 28
    )
  ) {
    return false;
  }

  return true;
}

function hasValidDeleteData(
  schedule: GroupedSchedule,
) {
  return (
    Number.isInteger(
      schedule.scheduleId,
    ) &&
    schedule.scheduleId > 0 &&
    Array.isArray(
      schedule.deviceIds,
    ) &&
    schedule.deviceIds.length > 0
  );
}

function isValidScheduleName(
  name?: string | null,
) {
  return (
    typeof name ===
      "string" &&
    name.trim().length > 0
  );
}

function isValidTimestamp(
  timestamp?: number | null,
) {
  if (
    timestamp === undefined ||
    timestamp === null ||
    !Number.isFinite(
      timestamp,
    ) ||
    timestamp <= 0
  ) {
    return false;
  }

  const date =
    new Date(
      timestamp * 1000,
    );

  return !Number.isNaN(
    date.getTime(),
  );
}

/* ==========================================
   DIAS
   ========================================== */

function getSelectedDays(
  schedule: GroupedSchedule,
) {
  if (
    !Number.isFinite(
      schedule.repetitionValue,
    )
  ) {
    return [];
  }

  try {
    return decodeWeekDays(
      schedule.repetitionValue,
    );
  } catch {
    return [];
  }
}

/* ==========================================
   FORMATADORES
   ========================================== */

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
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(
      value,
    )
  ) {
    return "Indisponível";
  }

  const speeds: Record<
    number,
    string
  > = {
    1: "Baixa",
    2: "Média",
    3: "Alta",
  };

  return (
    speeds[value] ??
    "Indisponível"
  );
}

function formatScheduleMode(
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

  if (
    parameters.modeAC === 0
  ) {
    return "Frio";
  }

  if (
    parameters.modeAC === 1
  ) {
    return "Quente";
  }

  if (
    parameters.modeAC === 2
  ) {
    return "Automático";
  }

  if (
    parameters.modeAC === 3
  ) {
    return "Ventilar";
  }

  return "Indisponível";
}

function formatScheduleTime(
  timestamp?: number | null,
) {
  if (
    !isValidTimestamp(
      timestamp,
    )
  ) {
    return "Indisponível";
  }

  const date =
    new Date(
      timestamp! * 1000,
    );

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
    ).format(date);
  } catch {
    return "Indisponível";
  }
}

/* ==========================================
   ÍCONES
   ========================================== */

function CalendarIcon() {
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
    </svg>
  );
}

function ActiveIcon() {
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m8 5 11 7-11 7Z" />
    </svg>
  );
}

function ClockIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4l3 2" />
    </svg>
  );
}

function ClockSmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4l3 2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-blue-300"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m15 8 4 4-4 4" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 transition group-hover:rotate-45"
      aria-hidden="true"
    >
      <path d="M20 6v5h-5" />

      <path d="M4 18v-5h5" />

      <path d="M18.5 9A7 7 0 0 0 6.4 6.4L4 9" />

      <path d="M5.5 15A7 7 0 0 0 17.6 17.6L20 15" />
    </svg>
  );
}

function EditIcon() {
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
      <path d="M12 20h9" />

      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
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

function ModeIcon() {
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
      <path d="M12 2v20" />

      <path d="M4.2 6.5l15.6 11" />

      <path d="M19.8 6.5l-15.6 11" />
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

function FanIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="2"
      />

      <path d="M12 10c-1-4 1-7 3-7 2.5 0 3.5 4-1 7" />

      <path d="M14 12c4-1 7 1 7 3 0 2.5-4 3.5-7-1" />

      <path d="M12 14c1 4-1 7-3 7-2.5 0-3.5-4 1-7" />

      <path d="M10 12c-4 1-7-1-7-3 0-2.5 4-3.5 7 1" />
    </svg>
  );
}

function EquipmentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-slate-400"
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
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5 animate-spin text-blue-600"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}