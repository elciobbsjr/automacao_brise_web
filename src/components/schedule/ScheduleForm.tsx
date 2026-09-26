"use client";

import {
  useState,
} from "react";

import type {
  DashboardDevice,
} from "@/types/dashboard";

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

import {
  TemperatureDial,
} from "@/components/device/control/TemperatureDial";

import {
  FanSpeedSelector,
} from "@/components/device/control/FanSpeedSelector";

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
    availableDevices.length >
      0 &&
    selectedDevices.length ===
      availableDevices.length;

  /* ==========================================
     DISPOSITIVOS
     ========================================== */

  function toggleAllDevices() {
    if (allSelected) {
      setSelectedDevices(
        [],
      );

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

  /* ==========================================
     DIAS
     ========================================== */

  function toggleDay(
    day: number,
  ) {
    setSelectedDays(
      (current) =>
        current.includes(
          day,
        )
          ? current.filter(
              (value) =>
                value !==
                day,
            )
          : [
              ...current,
              day,
            ],
    );
  }

  /* ==========================================
     TEMPERATURA
     ========================================== */

  function decreaseTemperature() {
    setTemperature(
      (value) =>
        Math.max(
          18,
          value - 1,
        ),
    );
  }

  function increaseTemperature() {
    setTemperature(
      (value) =>
        Math.min(
          28,
          value + 1,
        ),
    );
  }

  /* ==========================================
     RESET
     ========================================== */

  function resetForm() {
    setName("");

    setSelectedDevices(
      [],
    );

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

  /* ==========================================
     CRIAÇÃO
     ========================================== */

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

    /*
     * Caso o horário final seja
     * anterior ao inicial,
     * consideramos que termina
     * no dia seguinte.
     */
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
    <div className="mx-auto max-w-[1120px]">
      {/* ==========================================
          CABEÇALHO
          ========================================== */}

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600" />

          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
            Novo agendamento
          </h3>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Defina os equipamentos,
          horários e parâmetros de
          climatização da programação.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* ======================================
            COLUNA PRINCIPAL
            ====================================== */}

        <div className="space-y-5">
          {/* IDENTIFICAÇÃO */}

          <FormSection
            title="Identificação"
            description="Dê um nome para reconhecer esta programação."
            icon={
              <TagIcon />
            }
            tone="blue"
          >
            <label
              htmlFor="schedule-name"
              className="block"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700">
                  Nome do agendamento
                </span>

                <span className="text-[10px] font-medium text-slate-400">
                  {name.length}/20
                </span>
              </div>

              <input
                id="schedule-name"
                type="text"
                maxLength={20}
                value={name}
                onChange={(
                  event,
                ) =>
                  setName(
                    event.target
                      .value,
                  )
                }
                placeholder="Ex.: Expediente"
                autoComplete="off"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
              />
            </label>
          </FormSection>

          {/* DISPOSITIVOS */}

          <FormSection
            title="Equipamentos"
            description="Selecione os dispositivos que receberão o agendamento."
            icon={
              <EquipmentIcon />
            }
            tone="cyan"
            trailing={
              <span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700">
                {
                  selectedDevices.length
                }{" "}
                selecionado(s)
              </span>
            }
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Somente equipamentos
                online estão disponíveis.
              </p>

              <button
                type="button"
                onClick={
                  toggleAllDevices
                }
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
              >
                {allSelected
                  ? "Desmarcar todos"
                  : "Selecionar todos"}
              </button>
            </div>

            {availableDevices.length >
            0 ? (
              <div className="grid max-h-[300px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {availableDevices.map(
                  (device) => {
                    const selected =
                      selectedDevices.includes(
                        device.deviceId,
                      );

                    const deviceName =
                      device.config
                        ?.name ||
                      `Dispositivo ${device.deviceId}`;

                    const model =
                      device.config
                        ?.MODEL ||
                      "Modelo indisponível";

                    return (
                      <button
                        key={
                          device.deviceId
                        }
                        type="button"
                        onClick={() =>
                          toggleDevice(
                            device.deviceId,
                          )
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-blue-300 bg-blue-50/70 shadow-sm"
                            : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            selected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {selected ? (
                            <CheckIcon />
                          ) : (
                            <EquipmentSmallIcon />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {
                              deviceName
                            }
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-slate-400">
                            {model}
                            {" · Nº "}
                            {
                              device.deviceId
                            }
                          </p>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center">
                <p className="text-sm font-bold text-amber-900">
                  Nenhum equipamento
                  online
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Não existem dispositivos
                  disponíveis para receber
                  o agendamento.
                </p>
              </div>
            )}
          </FormSection>

          {/* PERÍODO */}

          <FormSection
            title="Período"
            description="Defina quando a programação deverá ser executada."
            icon={
              <CalendarIcon />
            }
            tone="indigo"
          >
            {/* DIAS */}

            <div>
              <p className="mb-2.5 text-xs font-bold text-slate-700">
                Dias da semana
              </p>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
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
                        className={`h-10 rounded-xl border text-[11px] font-bold transition ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white shadow-[0_5px_14px_rgba(37,99,235,0.18)]"
                            : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
            </div>

            {/* DATA */}

            <div className="mt-5">
              <label>
                <span className="mb-2 block text-xs font-bold text-slate-700">
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
                />
              </label>

              <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                Usada como referência
                para calcular os horários
                do agendamento.
              </p>
            </div>

            {/* HORÁRIOS */}

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <label>
                <span className="mb-2 block text-xs font-bold text-slate-700">
                  Início
                </span>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                    <ClockIcon />
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm font-bold text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
                  />
                </div>
              </label>

              <div className="hidden h-12 items-center justify-center text-slate-300 sm:flex">
                <ArrowRightIcon />
              </div>

              <label>
                <span className="mb-2 block text-xs font-bold text-slate-700">
                  Término
                </span>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                    <ClockIcon />
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm font-bold text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
                  />
                </div>
              </label>
            </div>
          </FormSection>
        </div>

        {/* ======================================
            CONTROLE DA CLIMATIZAÇÃO
            ====================================== */}

        <aside className="xl:sticky xl:top-0 xl:self-start">
          <div className="relative overflow-hidden rounded-[26px] border border-blue-100/80 bg-white/85 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-100/50 blur-3xl" />

            <div className="relative p-5">
              {/* CABEÇALHO */}

              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <RemoteIcon />
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-950">
                    Climatização
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Parâmetros que serão
                    aplicados pelo
                    agendamento.
                  </p>
                </div>
              </div>

              {/* MODO FIXO */}

              <div className="mb-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Modo
                </p>

                <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/55 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <SnowflakeIcon />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-blue-950">
                      Refrigeração
                    </p>

                    <p className="mt-0.5 text-[10px] text-blue-600">
                      Modo Frio
                    </p>
                  </div>
                </div>
              </div>

              {/* TEMPERATURA */}

              <TemperatureDial
                value={
                  temperature
                }
                enabled
                mode="cool"
                min={18}
                max={28}
                onDecrease={
                  decreaseTemperature
                }
                onIncrease={
                  increaseTemperature
                }
              />

              {/* VENTILAÇÃO */}

              <div className="mt-4 border-t border-slate-200/70 pt-4">
                <FanSpeedSelector
                  value={
                    fanSpeed
                  }
                  onChange={
                    setFanSpeed
                  }
                />
              </div>

              {/* ESTADO DO AGENDAMENTO */}

              <div className="mt-5 border-t border-slate-200/70 pt-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Estado do agendamento
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Define se será criado
                      ativo ou inativo.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${
                      enabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {enabled
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEnabled(
                      (value) =>
                        !value,
                    )
                  }
                  className={`relative mt-3 flex h-11 w-full items-center rounded-xl p-1 transition ${
                    enabled
                      ? "bg-emerald-500"
                      : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute h-9 w-[calc(50%-6px)] rounded-lg bg-white shadow-md transition-all duration-200 ${
                      enabled
                        ? "left-[calc(50%+2px)]"
                        : "left-1"
                    }`}
                  />

                  <span
                    className={`relative z-10 flex w-1/2 items-center justify-center text-xs font-bold transition ${
                      !enabled
                        ? "text-slate-900"
                        : "text-white/80"
                    }`}
                  >
                    Inativo
                  </span>

                  <span
                    className={`relative z-10 flex w-1/2 items-center justify-center text-xs font-bold transition ${
                      enabled
                        ? "text-emerald-700"
                        : "text-slate-500"
                    }`}
                  >
                    Ativo
                  </span>
                </button>
              </div>

              {/* FEEDBACK */}

              {message && (
                <div
                  className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium leading-5 ${
                    message.includes(
                      "sucesso",
                    )
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : message.includes(
                            "Criando",
                          )
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : message.includes(
                              "falhou",
                            )
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {loading ? (
                    <LoadingIcon />
                  ) : (
                    <InfoIcon />
                  )}

                  <span>
                    {message}
                  </span>
                </div>
              )}

              {/* BOTÃO */}

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  handleSubmit
                }
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_12px_28px_rgba(15,23,42,0.20)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoadingIcon />

                    Criando...
                  </>
                ) : (
                  <>
                    <CalendarPlusIcon />

                    Criar agendamento
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
                A programação será
                criada para todos os
                equipamentos selecionados.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ==========================================
   SEÇÃO DO FORMULÁRIO
   ========================================== */

type FormTone =
  | "blue"
  | "cyan"
  | "indigo";

function FormSection({
  title,
  description,
  icon,
  tone,
  trailing,
  children,
}: {
  title: string;

  description: string;

  icon:
    React.ReactNode;

  tone: FormTone;

  trailing?:
    React.ReactNode;

  children:
    React.ReactNode;
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
    <section className="rounded-[24px] border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles[tone]}`}
          >
            {icon}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-950">
              {title}
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {trailing && (
          <div className="shrink-0">
            {trailing}
          </div>
        )}
      </div>

      {children}
    </section>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function TagIcon() {
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
      <path d="M20 13 11 22l-9-9V4h9Z" />

      <circle
        cx="7"
        cy="9"
        r="1.5"
      />
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
      className="h-4 w-4"
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

function EquipmentSmallIcon() {
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
        y="6"
        width="18"
        height="10"
        rx="2"
      />

      <path d="M7 12h10" />
    </svg>
  );
}

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

function ClockIcon() {
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
        r="8"
      />

      <path d="M12 8v4l3 2" />
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

      <path d="m15 8 4 4-4 4" />
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

function SnowflakeIcon() {
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
      <path d="M12 2v20" />

      <path d="M4.2 6.5l15.6 11" />

      <path d="M19.8 6.5l-15.6 11" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CalendarPlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
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

      <path d="M12 14v4" />
      <path d="M10 16h4" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 11v5" />

      <path d="M12 8h.01" />
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
      className="h-4 w-4 animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}