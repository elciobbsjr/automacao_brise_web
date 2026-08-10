"use client";

import { useEffect, useState } from "react";
import { ScheduleDeleteModal } from "./ScheduleDeleteModal";
import { ScheduleToggleModal } from "./ScheduleToggleModal";

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

export function ScheduleList() {

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
  const [data, setData] =
    useState<ScheduleListResponse | null>(null);

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
</section>
  );
}

function ScheduleCard({
  schedule,
  onDelete,
  onToggle,
}: {
  schedule: GroupedSchedule;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const selectedDays =
    decodeWeekDays(
      schedule.repetitionValue,
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
      .setpointCool;

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {schedule.name}
            </h3>

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
          </div>

          <p className="mt-1 text-sm text-gray-500">
            ID {schedule.scheduleId}
          </p>
        </div>

        <div className="text-sm text-gray-600">
          {schedule.devicesCount} dispositivo(s)
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScheduleInfo
          label="Dias"
          value={
            dayLabels.length > 0
              ? dayLabels.join(" • ")
              : "Sem repetição"
          }
        />

        <ScheduleInfo
          label="Horário"
          value={`${startTime} → ${endTime}`}
        />

        <ScheduleInfo
          label="Temperatura"
          value={
            temperature === 0
              ? "Desligado"
              : `${temperature} °C`
          }
        />

        <ScheduleInfo
          label="Ventilação"
          value={formatFanSpeed(
            schedule.parameter
              .fanSpeed,
          )}
        />
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Dispositivos
        </p>

        <p className="mt-1 text-sm text-gray-700">
          {schedule.deviceIds.join(
            ", ",
          )}
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
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Editar
        </button>

        <button
        type="button"
        onClick={onToggle}
        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
        >
        {schedule.enable
            ? "Desativar"
            : "Ativar"}
        </button>

        <button
        type="button"
        onClick={onDelete}
        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
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

function formatFanSpeed(
  value: number,
) {
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
    timestamp === undefined ||
    timestamp === null ||
    !Number.isFinite(timestamp)
  ) {
    return "Indisponível";
  }

  const date = new Date(
    timestamp * 1000,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Indisponível";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
      timeZone:
        "America/Fortaleza",
    },
  ).format(date);
}