"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import type {
  ControlStatus,
  DeviceParameters,
} from "@/types/device-control";

import {
  updateDeviceParameters,
  waitForDeviceConfirmation,
} from "@/services/brise-control.service";

import {
  ACModeSelector,
} from "./control/ACModeSelector";

import {
  TemperatureDial,
  type TemperatureDialMode,
} from "./control/TemperatureDial";

import {
  PowerSelector,
} from "./control/PowerSelector";

import {
  FanSpeedSelector,
} from "./control/FanSpeedSelector";

import {
  AdvancedSettings,
} from "./control/AdvancedSettings";

interface GroupDeviceControlProps {
  devices: DashboardDevice[];
}

interface SuccessfulSend {
  success: true;
  deviceId: number;
  target: DeviceParameters;
}

interface FailedSend {
  success: false;
  deviceId: number;
  error: string;
}

type SendResult =
  | SuccessfulSend
  | FailedSend;

export function GroupDeviceControl({
  devices,
}: GroupDeviceControlProps) {
  const router = useRouter();

  const onlineDevices =
    useMemo(
      () =>
        devices.filter(
          (device) => device.online,
        ),
      [devices],
    );

  const referenceDevice =
    onlineDevices.find(
      (device) =>
        device.parameters,
    ) ?? onlineDevices[0];

  const parameters =
    referenceDevice?.parameters;

  const [
    modeDevice,
    setModeDevice,
  ] = useState(
    parameters?.modeDevice ?? 1,
  );

  const [
    modeAC,
    setModeAC,
  ] = useState(
    parameters?.modeAC ?? 0,
  );

  const [
    fanSpeed,
    setFanSpeed,
  ] = useState(
    parameters?.fanSpeed ?? 1,
  );

  const [
    setpointCool,
    setSetpointCool,
  ] = useState(
    getInitialCoolSetpoint(
      parameters?.setpointCool,
    ),
  );

  const [
    setpointHeat,
    setSetpointHeat,
  ] = useState(
    parameters?.setpointHeat ?? 0,
  );

  const [
    ecoCool,
    setEcoCool,
  ] = useState(
    parameters?.ecoCool ?? 25,
  );

  const [
    ecoHeat,
    setEcoHeat,
  ] = useState(
    parameters?.ecoHeat ?? 0,
  );

  const [
    acEnabled,
    setAcEnabled,
  ] = useState(
    referenceDevice?.variables?.state ===
      true,
  );

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    controlStatus,
    setControlStatus,
  ] = useState<ControlStatus>(
    "idle",
  );

  const sendingRef =
    useRef(false);

  const commandIdRef =
    useRef(0);

  const parameterCacheRef =
    useRef<
      Map<number, DeviceParameters>
    >(new Map());

  useEffect(() => {
  for (
    const device of onlineDevices
  ) {
    const normalizedParameters =
      normalizeDeviceParameters(
        device.parameters,
      );

    if (
      normalizedParameters &&
      !parameterCacheRef.current.has(
        device.deviceId,
      )
    ) {
      parameterCacheRef.current.set(
        device.deviceId,
        normalizedParameters,
      );
    }
  }

    const onlineIds =
      new Set(
        onlineDevices.map(
          (device) =>
            device.deviceId,
        ),
      );

    for (
      const deviceId of
      parameterCacheRef.current.keys()
    ) {
      if (
        !onlineIds.has(deviceId)
      ) {
        parameterCacheRef.current.delete(
          deviceId,
        );
      }
    }
  }, [onlineDevices]);

  useEffect(() => {
    setModeDevice(
      parameters?.modeDevice ?? 1,
    );

    setModeAC(
      parameters?.modeAC ?? 0,
    );

    setFanSpeed(
      parameters?.fanSpeed ?? 1,
    );

    setSetpointCool(
      getInitialCoolSetpoint(
        parameters?.setpointCool,
      ),
    );

    setSetpointHeat(
      parameters?.setpointHeat ??
        0,
    );

    setEcoCool(
      parameters?.ecoCool ?? 25,
    );

    setEcoHeat(
      parameters?.ecoHeat ?? 0,
    );

    setAcEnabled(
      referenceDevice?.variables
        ?.state === true,
    );
  }, [
    parameters,
    referenceDevice?.deviceId,
    referenceDevice?.variables
      ?.state,
  ]);

  if (
    onlineDevices.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-center">
        <p className="text-sm font-bold text-amber-900">
          Nenhum equipamento online
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-700">
          Não há equipamentos
          disponíveis para controle
          neste grupo.
        </p>
      </div>
    );
  }

  const temperatureDialMode:
    TemperatureDialMode =
      modeDevice === 3
        ? "eco"
        : modeAC === 1
          ? "heat"
          : modeAC === 3
            ? "fan"
            : "cool";

  async function applyToGroup(
    actionLabel: string,
    transform: (
      current: DeviceParameters,
      device: DashboardDevice,
    ) => DeviceParameters,
  ) {
    if (sendingRef.current) {
      return;
    }

    sendingRef.current = true;

    setSending(true);

    const commandId =
      ++commandIdRef.current;

    setControlStatus("sending");

    setMessage(
      `Enviando ${actionLabel} para ${onlineDevices.length} ${
        onlineDevices.length === 1
          ? "equipamento"
          : "equipamentos"
      }...`,
    );

    try {
      const results =
        await mapWithConcurrency(
          onlineDevices,
          5,
          async (
            device,
          ): Promise<SendResult> => {
            const cached =
              parameterCacheRef.current.get(
                device.deviceId,
              );

            const current =
              cached
                ? {
                    ...cached,
                  }
                : normalizeDeviceParameters(
                    device.parameters,
                  );

            if (!current) {
              return {
                success: false,
                deviceId:
                  device.deviceId,
                error:
                  "Parâmetros indisponíveis.",
              };
            }

            const target =
              transform(
                current,
                device,
              );

            try {
              await updateDeviceParameters(
                device.deviceId,
                target,
              );

              parameterCacheRef.current.set(
                device.deviceId,
                {
                  ...target,
                },
              );

              return {
                success: true,
                deviceId:
                  device.deviceId,
                target,
              };
            } catch (error) {
              return {
                success: false,
                deviceId:
                  device.deviceId,
                error:
                  error instanceof
                  Error
                    ? error.message
                    : "Erro ao enviar comando.",
              };
            }
          },
        );

      const successful =
        results.filter(
          (
            result,
          ): result is SuccessfulSend =>
            result.success,
        );

      const failed =
        results.filter(
          (
            result,
          ): result is FailedSend =>
            !result.success,
        );

      router.refresh();

      if (
        successful.length === 0
      ) {
        setControlStatus(
          "error",
        );

        setMessage(
          `Não foi possível enviar ${actionLabel} para nenhum equipamento.`,
        );

        return;
      }

      setControlStatus(
        "waiting",
      );

      if (
        failed.length === 0
      ) {
        setMessage(
          `${successful.length} ${
            successful.length === 1
              ? "comando enviado"
              : "comandos enviados"
          }. Aguardando confirmação dos equipamentos...`,
        );
      } else {
        setMessage(
          `${successful.length} enviados · ${failed.length} falharam. Aguardando confirmação dos demais...`,
        );
      }

      void confirmGroupCommand(
        commandId,
        actionLabel,
        successful,
        failed.length,
      );
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  async function confirmGroupCommand(
    commandId: number,
    actionLabel: string,
    successful:
      SuccessfulSend[],
    failedCount: number,
  ) {
    const confirmations =
      await mapWithConcurrency(
        successful,
        4,
        async (item) => {
          try {
            const confirmed =
              await waitForDeviceConfirmation(
                item.deviceId,
                item.target,
              );

            return confirmed;
          } catch {
            return false;
          }
        },
      );

    if (
      commandId !==
      commandIdRef.current
    ) {
      return;
    }

    const confirmedCount =
      confirmations.filter(
        Boolean,
      ).length;

    const pendingCount =
      successful.length -
      confirmedCount;

    router.refresh();

    if (
      confirmedCount ===
        successful.length &&
      failedCount === 0
    ) {
      setControlStatus(
        "confirmed",
      );

      setMessage(
        `${confirmedCount} de ${onlineDevices.length} equipamentos confirmaram ${actionLabel}.`,
      );

      return;
    }

    setControlStatus(
      "warning",
    );

    const parts: string[] = [];

    if (
      confirmedCount > 0
    ) {
      parts.push(
        `${confirmedCount} confirmados`,
      );
    }

    if (
      pendingCount > 0
    ) {
      parts.push(
        `${pendingCount} ainda sem confirmação`,
      );
    }

    if (
      failedCount > 0
    ) {
      parts.push(
        `${failedCount} falharam`,
      );
    }

    setMessage(
      parts.join(" · "),
    );
  }

  function handleEnable() {
    if (sendingRef.current) {
      return;
    }

    const fallbackTemperature =
      setpointCool >= 18 &&
      setpointCool <= 28
        ? setpointCool
        : 23;

    setAcEnabled(true);

    if (
      setpointCool < 18 ||
      setpointCool > 28
    ) {
      setSetpointCool(
        fallbackTemperature,
      );
    }

    void applyToGroup(
      "o comando de ligar",
      (current) => ({
        ...current,
        setpointCool:
          current.setpointCool >=
            18 &&
          current.setpointCool <=
            28
            ? current.setpointCool
            : fallbackTemperature,
      }),
    );
  }

  function handleDisable() {
    if (sendingRef.current) {
      return;
    }

    setAcEnabled(false);

    void applyToGroup(
      "o comando de desligar",
      (current) => ({
        ...current,
        setpointCool: 0,
      }),
    );
  }

  function handleModeChange(
    nextModeDevice: number,
    nextModeAC: number,
  ) {
    if (sendingRef.current) {
      return;
    }

    setModeDevice(
      nextModeDevice,
    );

    setModeAC(
      nextModeAC,
    );

    void applyToGroup(
      "o novo modo",
      (current) => ({
        ...current,
        modeDevice:
          nextModeDevice,
        modeAC:
          nextModeAC,
      }),
    );
  }

  function handleDecreaseTemperature() {
    if (
      sendingRef.current ||
      !acEnabled ||
      setpointCool <= 18
    ) {
      return;
    }

    const nextTemperature =
      Math.max(
        18,
        setpointCool - 1,
      );

    setSetpointCool(
      nextTemperature,
    );

    void applyToGroup(
      `a temperatura de ${nextTemperature} °C`,
      (current) => ({
        ...current,
        setpointCool:
          nextTemperature,
      }),
    );
  }

  function handleIncreaseTemperature() {
    if (
      sendingRef.current ||
      !acEnabled ||
      setpointCool >= 28
    ) {
      return;
    }

    const nextTemperature =
      Math.min(
        28,
        setpointCool + 1,
      );

    setSetpointCool(
      nextTemperature,
    );

    void applyToGroup(
      `a temperatura de ${nextTemperature} °C`,
      (current) => ({
        ...current,
        setpointCool:
          nextTemperature,
      }),
    );
  }

  function handleFanSpeedChange(
    nextFanSpeed: number,
  ) {
    if (sendingRef.current) {
      return;
    }

    setFanSpeed(
      nextFanSpeed,
    );

    void applyToGroup(
      "a nova velocidade de ventilação",
      (current) => ({
        ...current,
        fanSpeed:
          nextFanSpeed,
      }),
    );
  }

  function handleModeDeviceChange(
    nextModeDevice: number,
  ) {
    if (sendingRef.current) {
      return;
    }

    setModeDevice(
      nextModeDevice,
    );

    void applyToGroup(
      "o novo modo do dispositivo",
      (current) => ({
        ...current,
        modeDevice:
          nextModeDevice,
      }),
    );
  }

  function handleSetpointHeatChange(
    nextValue: number,
  ) {
    if (sendingRef.current) {
      return;
    }

    setSetpointHeat(
      nextValue,
    );

    void applyToGroup(
      "o novo setpoint de aquecimento",
      (current) => ({
        ...current,
        setpointHeat:
          nextValue,
      }),
    );
  }

  function handleEcoCoolChange(
    nextValue: number,
  ) {
    if (sendingRef.current) {
      return;
    }

    setEcoCool(
      nextValue,
    );

    void applyToGroup(
      "o novo setpoint Eco de refrigeração",
      (current) => ({
        ...current,
        ecoCool:
          nextValue,
      }),
    );
  }

  function handleEcoHeatChange(
    nextValue: number,
  ) {
    if (sendingRef.current) {
      return;
    }

    setEcoHeat(
      nextValue,
    );

    void applyToGroup(
      "o novo setpoint Eco de aquecimento",
      (current) => ({
        ...current,
        ecoHeat:
          nextValue,
      }),
    );
  }

  return (
    <section className="space-y-5">
      <div
        className={
          sending
            ? "pointer-events-none space-y-5 opacity-60 transition"
            : "space-y-5 transition"
        }
        aria-busy={
          sending
        }
      >
        <ACModeSelector
          modeDevice={
            modeDevice
          }
          modeAC={modeAC}
          onChange={
            handleModeChange
          }
        />

        <TemperatureDial
          value={
            setpointCool
          }
          enabled={
            acEnabled
          }
          mode={
            temperatureDialMode
          }
          min={18}
          max={28}
          onDecrease={
            handleDecreaseTemperature
          }
          onIncrease={
            handleIncreaseTemperature
          }
        />

        <PowerSelector
          enabled={
            acEnabled
          }
          onEnable={
            handleEnable
          }
          onDisable={
            handleDisable
          }
        />

        <FanSpeedSelector
          value={
            fanSpeed
          }
          onChange={
            handleFanSpeedChange
          }
        />

        <AdvancedSettings
          modeDevice={
            modeDevice
          }
          modeAC={
            modeAC
          }
          setpointHeat={
            setpointHeat
          }
          ecoCool={
            ecoCool
          }
          ecoHeat={
            ecoHeat
          }
          onModeDeviceChange={
            handleModeDeviceChange
          }
          onSetpointHeatChange={
            handleSetpointHeatChange
          }
          onEcoCoolChange={
            handleEcoCoolChange
          }
          onEcoHeatChange={
            handleEcoHeatChange
          }
        />
      </div>

      {message && (
        <GroupControlFeedback
          status={
            controlStatus
          }
          message={
            message
          }
        />
      )}

      <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <GroupIcon />
          </div>

          <div>
            <p className="text-xs font-bold text-blue-950">
              Controle coletivo ativo
            </p>

            <p className="mt-1 text-[11px] leading-5 text-blue-700">
              Cada alteração é enviada
              automaticamente para{" "}
              <strong>
                {onlineDevices.length}
              </strong>{" "}
              {onlineDevices.length ===
              1
                ? "equipamento online"
                : "equipamentos online"}{" "}
              deste grupo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function GroupControlFeedback({
  status,
  message,
}: {
  status: ControlStatus;
  message: string;
}) {
  const styles: Record<
    ControlStatus,
    string
  > = {
    idle: "",
    sending:
      "border-blue-200 bg-blue-50 text-blue-700",
    waiting:
      "border-amber-200 bg-amber-50 text-amber-700",
    confirmed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning:
      "border-amber-200 bg-amber-50 text-amber-700",
    error:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium leading-5 ${styles[status]}`}
    >
      <span className="mt-0.5 shrink-0">
        {status ===
        "confirmed" ? (
          <CheckIcon />
        ) : status ===
          "error" ? (
          <WarningIcon />
        ) : status ===
            "sending" ||
          status ===
            "waiting" ? (
          <LoadingIcon />
        ) : (
          <InfoIcon />
        )}
      </span>

      <span>
        {message}
      </span>
    </div>
  );
}

async function mapWithConcurrency<
  T,
  R,
>(
  items: T[],
  limit: number,
  worker: (
    item: T,
  ) => Promise<R>,
): Promise<R[]> {
  if (
    items.length === 0
  ) {
    return [];
  }

  const results =
    new Array<R>(
      items.length,
    );

  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const index =
        nextIndex++;

      if (
        index >=
        items.length
      ) {
        return;
      }

      results[index] =
        await worker(
          items[index],
        );
    }
  }

  const workers =
    Array.from({
      length: Math.min(
        limit,
        items.length,
      ),
    }).map(() =>
      runWorker(),
    );

  await Promise.all(
    workers,
  );

  return results;
}

function normalizeDeviceParameters(
  parameters:
    | DashboardDevice["parameters"]
    | undefined,
): DeviceParameters | null {
  if (!parameters) {
    return null;
  }

  if (
    typeof parameters.modeDevice !==
      "number" ||
    typeof parameters.modeAC !==
      "number" ||
    typeof parameters.fanSpeed !==
      "number" ||
    typeof parameters.setpointCool !==
      "number" ||
    typeof parameters.setpointHeat !==
      "number" ||
    typeof parameters.ecoCool !==
      "number" ||
    typeof parameters.ecoHeat !==
      "number"
  ) {
    return null;
  }

  return {
    modeDevice:
      parameters.modeDevice,
    modeAC:
      parameters.modeAC,
    fanSpeed:
      parameters.fanSpeed,
    setpointCool:
      parameters.setpointCool,
    setpointHeat:
      parameters.setpointHeat,
    ecoCool:
      parameters.ecoCool,
    ecoHeat:
      parameters.ecoHeat,
  };
}

function getInitialCoolSetpoint(
  value?: number,
) {
  if (
    value !== undefined &&
    value >= 18 &&
    value <= 28
  ) {
    return value;
  }

  return 23;
}

function GroupIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle
        cx="9"
        cy="7"
        r="4"
      />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function InfoIcon() {
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