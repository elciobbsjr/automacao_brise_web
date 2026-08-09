"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { DashboardDevice } from "@/types/dashboard";

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
    useState(parameters?.setpointCool ?? 23);

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

    useEffect(() => {
  if (!parameters) {
    return;
  }

    setModeDevice(parameters.modeDevice ?? 1);
    setModeAC(parameters.modeAC ?? 0);
    setFanSpeed(parameters.fanSpeed ?? 1);

    setSetpointCool(parameters.setpointCool ?? 0);
    setSetpointHeat(parameters.setpointHeat ?? 0);

    setEcoCool(parameters.ecoCool ?? 25);
    setEcoHeat(parameters.ecoHeat ?? 0);

    setMessage("");
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
    setpointCool !== 0 &&
    (setpointCool < 18 || setpointCool > 28)
  ) {
    return "A temperatura de refrigeração deve estar entre 18 °C e 28 °C ou ser 0 para desativar.";
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

  async function handleSave() {
  try {
    setLoading(true);
    setMessage("");

    const validationError = validateParameters();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    const confirmed = window.confirm(
      `Deseja aplicar estas alterações no dispositivo ${device.deviceId}?`,
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(
      `/api/brise/devices/${device.deviceId}/parameters`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modeDevice,
          modeAC,
          fanSpeed,
          setpointCool,
          setpointHeat,
          ecoCool,
          ecoHeat,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Não foi possível enviar o comando.",
      );
    }

    setMessage("Alterações enviadas com sucesso.");

    router.refresh();
  } catch (error) {
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

        <ControlField label="Temperatura de refrigeração">
            <input
            type="number"
            min={0}
            max={28}
            value={setpointCool}
            disabled={modeAC === 1}
            onChange={(event) =>
                setSetpointCool(Number(event.target.value))
            }
            className="w-full rounded-lg border border-gray-200 p-2.5 disabled:bg-gray-100 disabled:text-gray-400"
            />
        </ControlField>

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
        <p className="mt-4 text-sm text-gray-700">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
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