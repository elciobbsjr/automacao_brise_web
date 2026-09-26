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

    setControlStatus(
      "idle",
    );
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

  /*
   * Define a identidade visual
   * do mostrador de temperatura.
   *
   * Frio:
   * modeDevice diferente de Eco
   * e modeAC = 0
   *
   * Quente:
   * modeAC = 1
   *
   * Ventilar:
   * modeAC = 3
   *
   * Eco:
   * modeDevice = 3
   */
  const temperatureDialMode: TemperatureDialMode =
    modeDevice === 3
      ? "eco"
      : modeAC === 1
        ? "heat"
        : modeAC === 3
          ? "fan"
          : "cool";

  /* ==========================================
     VALIDAÇÃO
     ========================================== */

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

  /* ==========================================
     ENVIO
     ========================================== */

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

  /* ==========================================
     AÇÕES
     ========================================== */

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

  function handleDecreaseTemperature() {
    if (
      loading ||
      !acEnabled ||
      setpointCool <= 18
    ) {
      return;
    }

    setSetpointCool(
      (value) =>
        Math.max(
          18,
          value - 1,
        ),
    );
  }

  function handleIncreaseTemperature() {
    if (
      loading ||
      !acEnabled ||
      setpointCool >= 28
    ) {
      return;
    }

    setSetpointCool(
      (value) =>
        Math.min(
          28,
          value + 1,
        ),
    );
  }

  return (
    <section className="space-y-5">
      {/* ==========================================
          MODO
          ========================================== */}

      <ACModeSelector
        modeDevice={
          modeDevice
        }
        modeAC={modeAC}
        onChange={
          handleModeChange
        }
      />

      {/* ==========================================
          TEMPERATURA
          ========================================== */}

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

      {/* ==========================================
          LIGAR / DESLIGAR
          ========================================== */}

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

      {/* ==========================================
          VENTILADOR
          ========================================== */}

      <FanSpeedSelector
        value={
          fanSpeed
        }
        onChange={
          setFanSpeed
        }
      />

      {/* ==========================================
          CONFIGURAÇÕES AVANÇADAS
          ========================================== */}

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

      {/* ==========================================
          FEEDBACK
          ========================================== */}

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

      {/* ==========================================
          APLICAR
          ========================================== */}

      <button
        type="button"
        onClick={
          handleSave
        }
        disabled={
          loading
        }
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-md shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {controlStatus ===
        "waiting" ? (
          <>
            <LoadingIcon />

            Confirmando...
          </>
        ) : loading ? (
          <>
            <LoadingIcon />

            Enviando...
          </>
        ) : (
          <>
            <SaveIcon />

            Aplicar alterações
          </>
        )}
      </button>

      <p className="text-center text-[10px] leading-4 text-slate-400">
        As alterações só são
        enviadas ao equipamento
        após clicar em aplicar.
      </p>
    </section>
  );
}

/* ==========================================
   FEEDBACK
   ========================================== */

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

/* ==========================================
   SETPOINT INICIAL
   ========================================== */

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

/* ==========================================
   ÍCONES
   ========================================== */

function SaveIcon() {
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
      <path d="M5 3h12l2 2v16H5Z" />

      <path d="M8 3v6h8V3" />

      <path d="M8 21v-7h8v7" />
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