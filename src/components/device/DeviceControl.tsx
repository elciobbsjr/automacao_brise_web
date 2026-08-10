"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { DashboardDevice } from "@/types/dashboard";

import type {
  ControlStatus,
  DeviceParameters,
} from "@/types/device-control";

import {
  updateDeviceParameters,
  waitForDeviceConfirmation,
} from "@/services/brise-control.service";

interface DeviceControlProps {
  device: DashboardDevice;
}

export function DeviceControl({
  device,
}: DeviceControlProps) {
  const router = useRouter();

  const parameters = device.parameters;

  const [modeDevice, setModeDevice] = useState(
    parameters?.modeDevice ?? 1,
  );

  const [modeAC, setModeAC] = useState(
    parameters?.modeAC ?? 0,
  );

  const [fanSpeed, setFanSpeed] = useState(
    parameters?.fanSpeed ?? 1,
  );

  const [setpointCool, setSetpointCool] =
  useState(parameters?.setpointCool ?? 0);

  const [setpointHeat, setSetpointHeat] =
    useState(parameters?.setpointHeat ?? 0);

  const [ecoCool, setEcoCool] =
    useState(parameters?.ecoCool ?? 25);

  const [ecoHeat, setEcoHeat] =
    useState(parameters?.ecoHeat ?? 0);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [controlStatus, setControlStatus] =
  useState<ControlStatus>("idle");

  const [acEnabled, setAcEnabled] = useState(
  (parameters?.setpointCool ?? 0) > 0,
);
    useEffect(() => {
  if (!parameters) {
    return;
  }


    setAcEnabled((parameters.setpointCool ?? 0) > 0);
    setModeDevice(parameters.modeDevice ?? 1);
    setModeAC(parameters.modeAC ?? 0);
    setFanSpeed(parameters.fanSpeed ?? 1);

    setSetpointCool(parameters.setpointCool ?? 0);
    setSetpointHeat(parameters.setpointHeat ?? 0);

    setEcoCool(parameters.ecoCool ?? 25);
    setEcoHeat(parameters.ecoHeat ?? 0);

    setMessage("");
    setControlStatus("idle");
    }, [
    device.deviceId,
    parameters,
    ]);

    

    function validateParameters(): string | null {
  if (modeDevice < 0 || modeDevice > 3) {
    return "Modo do dispositivo inválido.";
  }

  if (modeAC < 0 || modeAC > 3) {
    return "Modo do ar-condicionado inválido.";
  }

  if (fanSpeed < 1 || fanSpeed > 3) {
    return "Velocidade do ventilador inválida.";
  }

  if (modeDevice === 3 && modeAC === 3) {
    return "O modo Ventilação não pode ser usado junto com o modo Eco.";
  }

  if (modeAC === 2 && modeDevice !== 3) {
    return "O modo Automático só pode ser utilizado no modo Eco.";
  }

    if (
    effectiveSetpointCool !== 0 &&
    (
        effectiveSetpointCool < 18 ||
        effectiveSetpointCool > 28
    )
    ) {
    return "A temperatura deve estar entre 18 °C e 28 °C.";
    }

  if (
    setpointHeat !== 0 &&
    (setpointHeat < 18 || setpointHeat > 28)
  ) {
    return "A temperatura de aquecimento deve estar entre 18 °C e 28 °C ou ser 0 para desativar.";
  }

  if (ecoCool < 18 || ecoCool > 28) {
    return "A temperatura Eco de refrigeração deve estar entre 18 °C e 28 °C.";
  }

  if (
    ecoHeat !== 0 &&
    (ecoHeat < 18 || ecoHeat > 28)
  ) {
    return "A temperatura Eco de aquecimento deve estar entre 18 °C e 28 °C ou ser 0.";
  }

  return null;
}

    const effectiveSetpointCool = acEnabled ? setpointCool : 0;

async function handleSave() {
  const validationError = validateParameters();

  if (validationError) {
    setControlStatus("error");
    setMessage(validationError);
    return;
  }

  const confirmed = window.confirm(
    `Deseja aplicar estas alterações no dispositivo ${device.deviceId}?`,
  );

  if (!confirmed) {
    return;
  }

  const targetParameters: DeviceParameters = {
    modeDevice,
    modeAC,
    fanSpeed,
    setpointCool: effectiveSetpointCool,
    setpointHeat,
    ecoCool,
    ecoHeat,
  };

  try {
    setLoading(true);

    setControlStatus("sending");
    setMessage("Enviando comando...");

    await updateDeviceParameters(
      device.deviceId,
      targetParameters,
    );

    setControlStatus("waiting");

    setMessage(
      "Comando enviado. Aguardando confirmação do dispositivo...",
    );

    const deviceConfirmed =
      await waitForDeviceConfirmation(
        device.deviceId,
        targetParameters,
      );

    router.refresh();

    if (deviceConfirmed) {
      setControlStatus("confirmed");

      setMessage(
        "Alteração confirmada pelo dispositivo.",
      );

      return;
    }

    setControlStatus("warning");

    setMessage(
      "O comando foi enviado, mas o dispositivo ainda não confirmou a alteração.",
    );
  } catch (error) {
    setControlStatus("error");

    setMessage(
      error instanceof Error
        ? error.message
        : "Erro ao enviar comando.",
    );
  } finally {
    setLoading(false);
  }
}

  if (!device.online || !parameters) {
    return null;
  }

  return (
    <section className="border-t border-gray-200 pt-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Controle do equipamento
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <ControlField label="Modo do dispositivo">
          <select
            value={modeDevice}
            onChange={(event) =>
              setModeDevice(
                Number(event.target.value),
              )
            }
            className="w-full rounded-lg border border-gray-200 bg-white p-2.5"
          >
            <option value={0}>Desligado</option>
            <option value={1}>Manual</option>
            <option value={2}>Absoluto</option>
            <option value={3}>Eco</option>
          </select>
        </ControlField>

        <ControlField label="Modo do ar">
          <select
            value={modeAC}
            onChange={(event) =>
                setModeAC(Number(event.target.value))
            }
            className="w-full rounded-lg border border-gray-200 bg-white p-2.5"
            >
            <option value={0}>Refrigeração</option>

            <option value={1}>Aquecimento</option>

            <option
                value={2}
                disabled={modeDevice !== 3}
            >
                Automático
            </option>

            <option
                value={3}
                disabled={modeDevice === 3}
            >
                Ventilação
            </option>
            </select>
        </ControlField>

        <ControlField label="Velocidade">
          <select
            value={fanSpeed}
            onChange={(event) =>
              setFanSpeed(
                Number(event.target.value),
              )
            }
            className="w-full rounded-lg border border-gray-200 bg-white p-2.5"
          >
            <option value={1}>Baixa</option>
            <option value={2}>Média</option>
            <option value={3}>Alta</option>
          </select>
        </ControlField>

        <ControlField label="Estado do ar-condicionado">
            <div className="flex gap-2">
                <button
                type="button"
                onClick={() => {
                setAcEnabled(true);

                if (setpointCool === 0) {
                    setSetpointCool(23);
                }
                }}
                className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition ${
                    acEnabled
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                >
                Ligado
                </button>

                <button
                type="button"
                onClick={() => setAcEnabled(false)}
                className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition ${
                    !acEnabled
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                >
                Desligado
                </button>
            </div>
        </ControlField>

        <ControlField label="Temperatura">
        <div className="flex items-center gap-2">
            <button
            type="button"
            disabled={!acEnabled || setpointCool <= 18}
            onClick={() =>
                setSetpointCool((value) =>
                Math.max(18, value - 1),
                )
            }
            className="rounded-lg border border-gray-200 px-4 py-2.5 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
            −
            </button>

            <div className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center font-semibold">
            {acEnabled
                ? `${setpointCool || 23} °C`
                : "Desligado"}
            </div>

            <button
            type="button"
            disabled={!acEnabled || setpointCool >= 28}
            onClick={() =>
                setSetpointCool((value) =>
                Math.min(28, value === 0 ? 23 : value + 1),
                )
            }
            className="rounded-lg border border-gray-200 px-4 py-2.5 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
            +
            </button>
        </div>
        </ControlField>

        <div className="sm:col-span-2 mt-3 border-t border-gray-200 pt-4">
            <p className="text-sm font-semibold text-gray-700">
                Configurações avançadas
            </p>
        </div>
        <ControlField label="Temperatura de aquecimento">
        <input
        type="number"
        min={0}
        max={28}
        value={setpointHeat}
        disabled={modeAC === 0 || modeAC === 3}
        onChange={(event) =>
            setSetpointHeat(Number(event.target.value))
        }
        className="w-full rounded-lg border border-gray-200 p-2.5 disabled:bg-gray-100 disabled:text-gray-400"
        />
        </ControlField>

        <ControlField label="Eco refrigeração">
          <input
            type="number"
            min={18}
            max={28}
            value={ecoCool}
            onChange={(event) =>
              setEcoCool(
                Number(event.target.value),
              )
            }
            className="w-full rounded-lg border border-gray-200 p-2.5"
          />
        </ControlField>

        <ControlField label="Eco aquecimento">
          <input
            type="number"
            min={0}
            max={28}
            value={ecoHeat}
            onChange={(event) =>
              setEcoHeat(
                Number(event.target.value),
              )
            }
            className="w-full rounded-lg border border-gray-200 p-2.5"
          />
        </ControlField>
      </div>

        {message && (
        <ControlFeedback
            status={controlStatus}
            message={message}
        />
        )}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {controlStatus === "waiting"
        ? "Confirmando..."
        : loading
            ? "Enviando..."
            : "Aplicar alterações"}
      </button>
    </section>
  );
}

function ControlField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-medium text-gray-600">
        {label}
      </span>

      {children}
    </label>
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
      "bg-blue-50 text-blue-700 border-blue-100",
    waiting:
      "bg-yellow-50 text-yellow-700 border-yellow-100",
    confirmed:
      "bg-green-50 text-green-700 border-green-100",
    warning:
      "bg-yellow-50 text-yellow-700 border-yellow-100",
    error:
      "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div
      className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${styles[status]}`}
    >
      {status === "confirmed" && "✓ "}
      {status === "error" && "Erro: "}

      {message}
    </div>
  );
}