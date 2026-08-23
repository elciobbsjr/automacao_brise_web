"use client";

import {
  useEffect,
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

interface DeviceControlProps {
  device: DashboardDevice;
}

export function DeviceControl({
  device,
}: DeviceControlProps) {
  const router = useRouter();

  const parameters =
    device.parameters;

  const [
    modeDevice,
    setModeDevice,
  ] = useState(
    parameters?.modeDevice ??
      1,
  );

  const [
    modeAC,
    setModeAC,
  ] = useState(
    parameters?.modeAC ??
      0,
  );

  const [
    fanSpeed,
    setFanSpeed,
  ] = useState(
    parameters?.fanSpeed ??
      1,
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
    parameters?.setpointHeat ??
      0,
  );

  const [
    ecoCool,
    setEcoCool,
  ] = useState(
    parameters?.ecoCool ??
      25,
  );

  const [
    ecoHeat,
    setEcoHeat,
  ] = useState(
    parameters?.ecoHeat ??
      0,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    controlStatus,
    setControlStatus,
  ] =
    useState<ControlStatus>(
      "idle",
    );

  const [
    acEnabled,
    setAcEnabled,
  ] = useState(
    device.variables?.state ===
      true,
  );

  useEffect(() => {
    if (!parameters) {
      return;
    }

    setAcEnabled(
      device.variables?.state ===
        true,
    );

    setModeDevice(
      parameters.modeDevice ??
        1,
    );

    setModeAC(
      parameters.modeAC ?? 0,
    );

    setFanSpeed(
      parameters.fanSpeed ??
        1,
    );

    setSetpointCool(
      getInitialCoolSetpoint(
        parameters.setpointCool,
      ),
    );

    setSetpointHeat(
      parameters.setpointHeat ??
        0,
    );

    setEcoCool(
      parameters.ecoCool ??
        25,
    );

    setEcoHeat(
      parameters.ecoHeat ??
        0,
    );

    setMessage("");
    setControlStatus("idle");
  }, [
    device.deviceId,
    device.variables?.state,
    parameters,
  ]);

  if (
    !device.online ||
    !parameters
  ) {
    return null;
  }

  const effectiveSetpointCool =
    acEnabled
      ? setpointCool
      : 0;

  function validateParameters():
    | string
    | null {
    if (
      modeDevice < 0 ||
      modeDevice > 3
    ) {
      return "Modo do dispositivo inválido.";
    }

    if (
      modeAC < 0 ||
      modeAC > 3
    ) {
      return "Modo do ar-condicionado inválido.";
    }

    if (
      fanSpeed < 1 ||
      fanSpeed > 3
    ) {
      return "Velocidade do ventilador inválida.";
    }

    if (
      modeDevice === 3 &&
      modeAC === 3
    ) {
      return "O modo Ventilação não pode ser usado junto com o modo Eco.";
    }

    if (
      modeAC === 2 &&
      modeDevice !== 3
    ) {
      return "O modo Automático só pode ser utilizado no modo Eco.";
    }

    if (
      effectiveSetpointCool !==
        0 &&
      (
        effectiveSetpointCool <
          18 ||
        effectiveSetpointCool >
          28
      )
    ) {
      return "A temperatura deve estar entre 18 °C e 28 °C.";
    }

    if (
      setpointHeat !== 0 &&
      (
        setpointHeat < 18 ||
        setpointHeat > 28
      )
    ) {
      return "A temperatura de aquecimento deve estar entre 18 °C e 28 °C ou ser 0.";
    }

    if (
      ecoCool < 18 ||
      ecoCool > 28
    ) {
      return "A temperatura Eco de refrigeração deve estar entre 18 °C e 28 °C.";
    }

    if (
      ecoHeat !== 0 &&
      (
        ecoHeat < 18 ||
        ecoHeat > 28
      )
    ) {
      return "A temperatura Eco de aquecimento deve estar entre 18 °C e 28 °C ou ser 0.";
    }

    return null;
  }

  async function handleSave() {
    const validationError =
      validateParameters();

    if (validationError) {
      setControlStatus(
        "error",
      );

      setMessage(
        validationError,
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Deseja aplicar estas alterações no dispositivo ${device.deviceId}?`,
      );

    if (!confirmed) {
      return;
    }

    const targetParameters: DeviceParameters =
      {
        modeDevice,
        modeAC,
        fanSpeed,

        setpointCool:
          effectiveSetpointCool,

        setpointHeat,
        ecoCool,
        ecoHeat,
      };

    try {
      setLoading(true);

      setControlStatus(
        "sending",
      );

      setMessage(
        "Enviando comando...",
      );

      await updateDeviceParameters(
        device.deviceId,
        targetParameters,
      );

      setControlStatus(
        "waiting",
      );

      setMessage(
        "Comando enviado. Aguardando confirmação do dispositivo...",
      );

      const deviceConfirmed =
        await waitForDeviceConfirmation(
          device.deviceId,
          targetParameters,
        );

      router.refresh();

      if (
        deviceConfirmed
      ) {
        setControlStatus(
          "confirmed",
        );

        setMessage(
          "Alteração confirmada pelo dispositivo.",
        );

        return;
      }

      setControlStatus(
        "warning",
      );

      setMessage(
        "O comando foi enviado, mas o dispositivo ainda não confirmou a alteração.",
      );
    } catch (error) {
      setControlStatus(
        "error",
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao enviar comando.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEnable() {
    setAcEnabled(true);

    if (
      setpointCool < 18 ||
      setpointCool > 28
    ) {
      setSetpointCool(23);
    }
  }

  function handleModeChange(
    nextModeDevice: number,
    nextModeAC: number,
  ) {
    setModeDevice(
      nextModeDevice,
    );

    setModeAC(
      nextModeAC,
    );
  }

  return (
    <section className="space-y-5">
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
        min={18}
        max={28}
        onDecrease={() =>
          setSetpointCool(
            (value) =>
              Math.max(
                18,
                value - 1,
              ),
          )
        }
        onIncrease={() =>
          setSetpointCool(
            (value) =>
              Math.min(
                28,
                value + 1,
              ),
          )
        }
      />

      <PowerSelector
        enabled={
          acEnabled
        }
        onEnable={
          handleEnable
        }
        onDisable={() =>
          setAcEnabled(
            false,
          )
        }
      />

      <FanSpeedSelector
        value={fanSpeed}
        onChange={
          setFanSpeed
        }
      />

      <AdvancedSettings
        modeDevice={
          modeDevice
        }
        modeAC={modeAC}
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
          setModeDevice
        }
        onSetpointHeatChange={
          setSetpointHeat
        }
        onEcoCoolChange={
          setEcoCool
        }
        onEcoHeatChange={
          setEcoHeat
        }
      />

      {message && (
        <ControlFeedback
          status={
            controlStatus
          }
          message={
            message
          }
        />
      )}

      <button
        type="button"
        onClick={
          handleSave
        }
        disabled={
          loading
        }
        className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {controlStatus ===
        "waiting"
          ? "Confirmando..."
          : loading
            ? "Enviando..."
            : "Aplicar alterações"}
      </button>
    </section>
  );
}

function ControlFeedback({
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
      className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles[status]}`}
    >
      {status ===
        "confirmed" &&
        "✓ "}

      {status ===
        "error" &&
        "Erro: "}

      {message}
    </div>
  );
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