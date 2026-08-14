"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import type {
  GroupedSchedule,
} from "@/types/schedule";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  WEEK_DAYS,
} from "@/constants/schedule";

import {
  createUnixTimestamp,
  decodeWeekDays,
  encodeWeekDays,
} from "@/utils/schedule";

import {
  updateBatchSchedule,
} from "@/services/schedule.service";

interface ScheduleEditModalProps {
  schedule:
    | GroupedSchedule
    | null;

  devices: DashboardDevice[];

  open: boolean;

  onClose: () => void;

  onUpdated: () => void;
}

export function ScheduleEditModal({
  schedule,
  devices,
  open,
  onClose,
  onUpdated,
}: ScheduleEditModalProps) {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    name,
    setName,
  ] = useState("");

  const [
    selectedDevices,
    setSelectedDevices,
  ] = useState<number[]>([]);

  const [
    selectedDays,
    setSelectedDays,
  ] = useState<number[]>([]);

  const [
    scheduleDate,
    setScheduleDate,
  ] = useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [
    endTime,
    setEndTime,
  ] = useState("");

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

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (
      !open ||
      !schedule
    ) {
      return;
    }

    const timeZone =
      getScheduleTimeZone(
        schedule,
        devices,
      );

    const start =
      timestampToLocalParts(
        schedule.dateStart,
        timeZone,
      );

    const end =
      timestampToLocalParts(
        schedule.dateEnd,
        timeZone,
      );

    setName(
      schedule.name ?? "",
    );

    setSelectedDevices(
      [
        ...schedule.deviceIds,
      ],
    );

    setSelectedDays(
      decodeWeekDays(
        schedule.repetitionValue,
      ),
    );

    setScheduleDate(
      start.date,
    );

    setStartTime(
      start.time,
    );

    setEndTime(
      end.time,
    );

    setTemperature(
      schedule.parameter
        ?.setpointCool || 23,
    );

    setFanSpeed(
      schedule.parameter
        ?.fanSpeed || 2,
    );

    setEnabled(
      schedule.enable,
    );

    setMessage("");
  }, [
    open,
    schedule,
    devices,
  ]);

  if (
    !open ||
    !mounted ||
    !schedule
  ) {
    return null;
  }

  /*
   * A partir daqui o TypeScript sabe
   * definitivamente que não é null.
   *
   * Usamos currentSchedule nas funções
   * internas para evitar os erros
   * "'schedule' is possibly null".
   */
  const currentSchedule =
    schedule;

  const allSelected =
    selectedDevices.length ===
    currentSchedule.deviceIds.length;

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
                id !== deviceId,
            )
          : [
              ...current,
              deviceId,
            ],
    );
  }

  function selectAllDevices() {
    setSelectedDevices(
      [
        ...currentSchedule.deviceIds,
      ],
    );
  }

  function clearDevices() {
    setSelectedDevices([]);
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

  async function handleUpdate() {
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
        "Informe os horários.",
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

    const timeZone =
      getScheduleTimeZone(
        currentSchedule,
        devices,
      );

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
        `Salvar as alterações de "${name}" em ${selectedDevices.length} dispositivo(s)?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      setMessage(
        "Salvando alterações...",
      );

      const result =
        await updateBatchSchedule({
          scheduleId:
            currentSchedule.scheduleId,

          deviceIds:
            selectedDevices,

          name:
            name.trim(),

          enable:
            enabled,

          dateStart,
          dateEnd,

          repetitionMode:
            currentSchedule.repetitionMode,

          repetitionValue,

          parameter: {
            modeDevice:
              currentSchedule
                .parameter
                .modeDevice,

            modeAC:
              currentSchedule
                .parameter
                .modeAC,

            fanSpeed,

            setpointCool:
              temperature,

            setpointHeat:
              currentSchedule
                .parameter
                .setpointHeat,

            ecoCool:
              currentSchedule
                .parameter
                .ecoCool,

            ecoHeat:
              currentSchedule
                .parameter
                .ecoHeat,
          },
        });

      if (
        result.failureCount ===
        0
      ) {
        setMessage(
          `Agendamento atualizado com sucesso em ${result.successCount} dispositivo(s).`,
        );

        window.setTimeout(
          () => {
            onUpdated();
            onClose();
          },
          700,
        );

        return;
      }

      setMessage(
        `Atualizado em ${result.successCount} dispositivo(s), mas houve falha em ${result.failureCount}.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao editar agendamento.",
      );
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Editar agendamento
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              ID{" "}
              {
                currentSchedule.scheduleId
              }
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
          >
            Fechar
          </button>
        </header>

        <div className="space-y-6">
          <section>
            <label
              htmlFor="edit-schedule-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Nome do agendamento
            </label>

            <input
              id="edit-schedule-name"
              type="text"
              maxLength={20}
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900"
            />

            <p className="mt-1 text-xs text-gray-400">
              {name.length}/20
              caracteres
            </p>
          </section>

          <section>
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Aplicar alteração em
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {
                    selectedDevices.length
                  }{" "}
                  dispositivo(s)
                  selecionado(s)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    selectAllDevices
                  }
                  className="text-sm font-medium text-gray-700"
                >
                  Selecionar todos
                </button>

                <button
                  type="button"
                  onClick={
                    clearDevices
                  }
                  className="text-sm font-medium text-gray-500"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {currentSchedule
                .deviceIds
                .map(
                  (deviceId) => {
                    const selected =
                      selectedDevices.includes(
                        deviceId,
                      );

                    const device =
                      devices.find(
                        (item) =>
                          item.deviceId ===
                          deviceId,
                      );

                    const deviceName =
                      device
                        ?.config
                        ?.name ||
                      `Dispositivo ${deviceId}`;

                    return (
                      <label
                        key={
                          deviceId
                        }
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
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
                              deviceId,
                            )
                          }
                        />

                        <div>
                          <p className="font-medium text-gray-800">
                            {
                              deviceName
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            Nº{" "}
                            {
                              deviceId
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
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        selected
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600"
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
                onChange={(event) =>
                  setScheduleDate(
                    event.target.value,
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
                onChange={(event) =>
                  setStartTime(
                    event.target.value,
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
                onChange={(event) =>
                  setEndTime(
                    event.target.value,
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
                onChange={(event) =>
                  setTemperature(
                    Number(
                      event.target.value,
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
                onChange={(event) =>
                  setFanSpeed(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900"
              >
                <option value={1}>
                  Baixa
                </option>

                <option value={2}>
                  Média
                </option>

                <option value={3}>
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
                onChange={(event) =>
                  setEnabled(
                    event.target.checked,
                  )
                }
              />

              <span className="text-sm font-medium text-gray-700">
                Agendamento ativo
              </span>
            </label>
          </section>

          {message && (
            <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg bg-gray-100 px-5 py-3 font-medium text-gray-700"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={
                handleUpdate
              }
              disabled={
                loading ||
                selectedDevices.length ===
                  0
              }
              className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : allSelected
                  ? "Salvar em todos"
                  : `Salvar em ${selectedDevices.length}`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function getScheduleTimeZone(
  schedule: GroupedSchedule,
  devices: DashboardDevice[],
) {
  const device =
    devices.find(
      (item) =>
        schedule.deviceIds.includes(
          item.deviceId,
        ),
    );

  return (
    device?.config?.timeZone ??
    -3
  );
}

function timestampToLocalParts(
  timestamp: number,
  timeZone: number,
) {
  if (
    !Number.isFinite(
      timestamp,
    )
  ) {
    return {
      date: "",
      time: "",
    };
  }

  const localMilliseconds =
    timestamp * 1000 +
    timeZone *
      60 *
      60 *
      1000;

  const date =
    new Date(
      localMilliseconds,
    );

  const year =
    date.getUTCFullYear();

  const month =
    String(
      date.getUTCMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getUTCDate(),
    ).padStart(
      2,
      "0",
    );

  const hour =
    String(
      date.getUTCHours(),
    ).padStart(
      2,
      "0",
    );

  const minute =
    String(
      date.getUTCMinutes(),
    ).padStart(
      2,
      "0",
    );

  return {
    date:
      `${year}-${month}-${day}`,

    time:
      `${hour}:${minute}`,
  };
}