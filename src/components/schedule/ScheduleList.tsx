"use client";

import { useEffect, useState } from "react";

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

  const [data, setData] =
    useState<ScheduleListResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-gray-600">
          Carregando agendamentos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="font-medium text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={loadSchedules}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (
    !data ||
    data.schedules.length === 0
  ) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="font-medium text-gray-800">
          Nenhum agendamento encontrado.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Agendamentos existentes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {data.totalSchedules} agendamento(s)
          </p>
        </div>

        <button
          type="button"
          onClick={loadSchedules}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Atualizar
        </button>
      </div>

      <div className="grid gap-4">
        {data.schedules.map(
          (schedule, index) => (
            <ScheduleCard
              key={`${schedule.scheduleId}-${index}`}
              schedule={schedule}
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

      <ScheduleDeleteModal
        schedule={scheduleToDelete}
        open={
          scheduleToDelete !== null
        }
        onClose={() =>
          setScheduleToDelete(null)
        }
        onDeleted={() => {
          setScheduleToDelete(null);
          loadSchedules();
        }}
      />

      <ScheduleToggleModal
        schedule={scheduleToToggle}
        open={
          scheduleToToggle !== null
        }
        onClose={() =>
          setScheduleToToggle(null)
        }
        onUpdated={() => {
          setScheduleToToggle(null);
          loadSchedules();
        }}
      />

      <ScheduleEditModal
        schedule={scheduleToEdit}
        devices={devices}
        open={
          scheduleToEdit !== null
        }
        onClose={() =>
          setScheduleToEdit(null)
        }
        onUpdated={() => {
          setScheduleToEdit(null);
          loadSchedules();
        }}
      />
    </section>
  );
}

function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  onToggle,
}: {
  schedule: GroupedSchedule;
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

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        valid
          ? "border-transparent bg-white"
          : "border-amber-200 bg-amber-50/40"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {isValidScheduleName(
                schedule.name,
              )
                ? schedule.name
                : "Agendamento sem nome"}
            </h3>

            {valid ? (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  schedule.enable
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {schedule.enable
                  ? "Ativo"
                  : "Inativo"}
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Incompleto
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            ID{" "}
            {Number.isFinite(
              schedule.scheduleId,
            )
              ? schedule.scheduleId
              : "indisponível"}
          </p>
        </div>

        <div className="text-sm text-gray-600">
          {schedule.deviceIds?.length ??
            0}{" "}
          dispositivo(s)
        </div>
      </div>

      {!valid && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">
            Agendamento incompleto
          </p>

          <p className="mt-1 text-xs text-amber-700">
            Alguns dados deste
            agendamento não foram
            retornados corretamente.
            Para evitar alterações
            incorretas, a edição e a
            ativação foram bloqueadas.
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScheduleInfo
          label="Dias"
          value={
            dayLabels.length > 0
              ? dayLabels.join(" • ")
              : valid
                ? "Sem repetição"
                : "Indisponível"
          }
        />

        <ScheduleInfo
          label="Horário"
          value={
            startTime ===
              "Indisponível" ||
            endTime ===
              "Indisponível"
              ? "Indisponível"
              : `${startTime} → ${endTime}`
          }
        />

        <ScheduleInfo
          label="Temperatura"
          value={formatTemperature(
            temperature,
          )}
        />

        <ScheduleInfo
          label="Ventilação"
          value={formatFanSpeed(
            schedule.parameter
              ?.fanSpeed,
          )}
        />
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Dispositivos
        </p>

        <p className="mt-1 text-sm text-gray-700">
          {Array.isArray(
            schedule.deviceIds,
          ) &&
          schedule.deviceIds.length >
            0
            ? schedule.deviceIds.join(
                ", ",
              )
            : "Nenhum dispositivo associado"}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Ver dispositivos
        </button>

        <button
          type="button"
          onClick={onEdit}
          disabled={!valid}
          title={
            valid
              ? "Editar agendamento"
              : "Agendamentos incompletos não podem ser editados."
          }
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Editar
        </button>

        <button
          type="button"
          onClick={onToggle}
          disabled={!valid}
          title={
            valid
              ? schedule.enable
                ? "Desativar agendamento"
                : "Ativar agendamento"
              : "Agendamentos incompletos não podem ser ativados ou desativados."
          }
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {schedule.enable
            ? "Desativar"
            : "Ativar"}
        </button>

        <button
          type="button"
          onClick={onDelete}
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
          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}

function ScheduleInfo({
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

      <p className="mt-1 font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

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

  if (!schedule.parameter) {
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
    typeof name === "string" &&
    name.trim().length > 0
  );
}

function isValidTimestamp(
  timestamp?: number | null,
) {
  if (
    timestamp === undefined ||
    timestamp === null ||
    !Number.isFinite(timestamp) ||
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

function formatTemperature(
  value?: number | null,
) {
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(value)
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
    !Number.isFinite(value)
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
        hour: "2-digit",
        minute: "2-digit",
        timeZone:
          "America/Fortaleza",
      },
    ).format(date);
  } catch {
    return "Indisponível";
  }
}