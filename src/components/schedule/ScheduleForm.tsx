"use client";

import { useState } from "react";

import type { DashboardDevice } from "@/types/dashboard";

import {
  WEEK_DAYS,
} from "@/constants/schedule";

import {
  createUnixTimestamp,
  encodeWeekDays,
} from "@/utils/schedule";

import {
  createBatchSchedule,
} from "@/services/schedule.service";

interface ScheduleFormProps {
  devices: DashboardDevice[];
  onCreated?: () => void;
}

export function ScheduleForm({
  devices,
  onCreated,
}: ScheduleFormProps) {
  const availableDevices =
    devices.filter(
      (device) =>
        device.online,
    );

  const [name, setName] =
    useState("");

  const [
    selectedDevices,
    setSelectedDevices,
  ] = useState<number[]>([]);

  const [
    selectedDays,
    setSelectedDays,
  ] = useState<number[]>([
    1,
    2,
    4,
    8,
    16,
  ]);

  const [
    scheduleDate,
    setScheduleDate,
  ] = useState(() => {
    const today =
      new Date();

    return today
      .toISOString()
      .slice(0, 10);
  });

  const [
    startTime,
    setStartTime,
  ] = useState("08:00");

  const [
    endTime,
    setEndTime,
  ] = useState("18:00");

  const [
    temperature,
    setTemperature,
  ] = useState(23);

  const [
    fanSpeed,
    setFanSpeed,
  ] = useState(2);

  const [
    enabled,
    setEnabled,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const allSelected =
    availableDevices.length > 0 &&
    selectedDevices.length ===
      availableDevices.length;

  function toggleAllDevices() {
    if (allSelected) {
      setSelectedDevices([]);
      return;
    }

    setSelectedDevices(
      availableDevices.map(
        (device) =>
          device.deviceId,
      ),
    );
  }

  function toggleDevice(
    deviceId: number,
  ) {
    setSelectedDevices(
      (current) =>
        current.includes(
          deviceId,
        )
          ? current.filter(
              (id) =>
                id !==
                deviceId,
            )
          : [
              ...current,
              deviceId,
            ],
    );
  }

  function toggleDay(
    day: number,
  ) {
    setSelectedDays(
      (current) =>
        current.includes(day)
          ? current.filter(
              (value) =>
                value !== day,
            )
          : [
              ...current,
              day,
            ],
    );
  }

  function resetForm() {
    setName("");

    setSelectedDevices([]);

    setSelectedDays([
      1,
      2,
      4,
      8,
      16,
    ]);

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    setScheduleDate(
      today,
    );

    setStartTime(
      "08:00",
    );

    setEndTime(
      "18:00",
    );

    setTemperature(
      23,
    );

    setFanSpeed(
      2,
    );

    setEnabled(
      true,
    );

    setMessage("");
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setMessage(
        "Informe um nome para o agendamento.",
      );

      return;
    }

    if (
      selectedDevices.length ===
      0
    ) {
      setMessage(
        "Selecione pelo menos um dispositivo.",
      );

      return;
    }

    if (
      selectedDays.length ===
      0
    ) {
      setMessage(
        "Selecione pelo menos um dia.",
      );

      return;
    }

    if (!scheduleDate) {
      setMessage(
        "Informe a data de referência.",
      );

      return;
    }

    if (
      !startTime ||
      !endTime
    ) {
      setMessage(
        "Informe os horários inicial e final.",
      );

      return;
    }

    if (
      temperature < 18 ||
      temperature > 28
    ) {
      setMessage(
        "A temperatura deve estar entre 18 °C e 28 °C.",
      );

      return;
    }

    const selectedDevice =
      availableDevices.find(
        (device) =>
          device.deviceId ===
          selectedDevices[0],
      );

    const timeZone =
      selectedDevice
        ?.config
        ?.timeZone ??
      -3;

    const dateStart =
      createUnixTimestamp(
        scheduleDate,
        startTime,
        timeZone,
      );

    let dateEnd =
      createUnixTimestamp(
        scheduleDate,
        endTime,
        timeZone,
      );

    if (
      dateEnd <=
      dateStart
    ) {
      dateEnd +=
        24 * 60 * 60;
    }

    const repetitionValue =
      encodeWeekDays(
        selectedDays,
      );

    const confirmed =
      window.confirm(
        `Criar o agendamento "${name}" para ${selectedDevices.length} dispositivo(s)?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      setMessage(
        "Criando agendamento...",
      );

      const result =
        await createBatchSchedule({
          deviceIds:
            selectedDevices,

          name:
            name.trim(),

          enable:
            enabled,

          dateStart,
          dateEnd,

          repetitionMode:
            1,

          repetitionValue,

          parameter: {
            modeDevice:
              1,

            modeAC:
              0,

            fanSpeed,

            setpointCool:
              temperature,

            setpointHeat:
              0,

            ecoCool:
              25,

            ecoHeat:
              0,
          },
        });

      if (
        result.failureCount ===
        0
      ) {
        setMessage(
          `Agendamento criado com sucesso em ${result.successCount} dispositivo(s).`,
        );

        resetForm();

        window.setTimeout(
          () => {
            onCreated?.();
          },
          700,
        );

        return;
      }

      setMessage(
        `Agendamento criado em ${result.successCount} dispositivo(s), mas falhou em ${result.failureCount}.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao criar agendamento.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <label
          htmlFor="schedule-name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Nome do agendamento
        </label>

        <input
          id="schedule-name"
          type="text"
          maxLength={20}
          value={name}
          onChange={(event) =>
            setName(
              event.target.value,
            )
          }
          placeholder="Ex.: Expediente"
          autoComplete="off"
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />

        <p className="mt-1 text-xs text-gray-400">
          {name.length}/20
          caracteres
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Dispositivos
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {
                selectedDevices.length
              }{" "}
              selecionado(s)
            </p>
          </div>

          <button
            type="button"
            onClick={
              toggleAllDevices
            }
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {allSelected
              ? "Desmarcar todos"
              : "Selecionar todos"}
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {availableDevices.map(
            (device) => {
              const selected =
                selectedDevices.includes(
                  device.deviceId,
                );

              return (
                <label
                  key={
                    device.deviceId
                  }
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    selected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={
                      selected
                    }
                    onChange={() =>
                      toggleDevice(
                        device.deviceId,
                      )
                    }
                  />

                  <div>
                    <p className="font-medium text-gray-800">
                      {device.config
                        ?.name ||
                        `Dispositivo ${device.deviceId}`}
                    </p>

                    <p className="text-xs text-gray-500">
                      Nº{" "}
                      {
                        device.deviceId
                      }
                    </p>
                  </div>
                </label>
              );
            },
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-semibold text-gray-900">
          Dias da semana
        </h3>

        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map(
            (day) => {
              const selected =
                selectedDays.includes(
                  day.value,
                );

              return (
                <button
                  key={
                    day.value
                  }
                  type="button"
                  onClick={() =>
                    toggleDay(
                      day.value,
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selected
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {
                    day.shortLabel
                  }
                </button>
              );
            },
          )}
        </div>
      </section>

      <section>
        <label>
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Data de referência
          </span>

          <input
            type="date"
            value={
              scheduleDate
            }
            onChange={(
              event,
            ) =>
              setScheduleDate(
                event.target
                  .value,
              )
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900"
          />
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Horário inicial
          </span>

          <input
            type="time"
            value={
              startTime
            }
            onChange={(
              event,
            ) =>
              setStartTime(
                event.target
                  .value,
              )
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Horário final
          </span>

          <input
            type="time"
            value={
              endTime
            }
            onChange={(
              event,
            ) =>
              setEndTime(
                event.target
                  .value,
              )
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900"
          />
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Temperatura
          </span>

          <input
            type="number"
            min={18}
            max={28}
            value={
              temperature
            }
            onChange={(
              event,
            ) =>
              setTemperature(
                Number(
                  event.target
                    .value,
                ),
              )
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Ventilação
          </span>

          <select
            value={
              fanSpeed
            }
            onChange={(
              event,
            ) =>
              setFanSpeed(
                Number(
                  event.target
                    .value,
                ),
              )
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900"
          >
            <option
              value={1}
            >
              Baixa
            </option>

            <option
              value={2}
            >
              Média
            </option>

            <option
              value={3}
            >
              Alta
            </option>
          </select>
        </label>
      </section>

      <section>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={
              enabled
            }
            onChange={(
              event,
            ) =>
              setEnabled(
                event.target
                  .checked,
              )
            }
          />

          <span className="text-sm font-medium text-gray-700">
            Agendamento
            habilitado
          </span>
        </label>
      </section>

      {message && (
        <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
          {message}
        </div>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={
          handleSubmit
        }
        className="w-full rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Criando..."
          : "Criar agendamento"}
      </button>
    </div>
  );
}