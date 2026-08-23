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
  DeviceParameters,
} from "@/types/device-control";

import {
  updateDeviceParameters,
  waitForDeviceConfirmation,
} from "@/services/brise-control.service";

interface DeviceQuickControlProps {
  device: DashboardDevice;
}

export function DeviceQuickControl({
  device,
}: DeviceQuickControlProps) {
  const router = useRouter();

  const parameters =
    device.parameters;

  const [
    setpoint,
    setSetpoint,
  ] = useState(
    getInitialSetpoint(
      parameters?.setpointCool,
    ),
  );

  const [
    enabled,
    setEnabled,
  ] = useState(
    device.variables?.state ===
      true,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {
    if (!parameters) {
      return;
    }

    setEnabled(
      device.variables?.state ===
        true,
    );

    const currentSetpoint =
      parameters.setpointCool;

    if (
      currentSetpoint !==
        undefined &&
      currentSetpoint >= 18 &&
      currentSetpoint <= 28
    ) {
      setSetpoint(
        currentSetpoint,
      );
    }

    setMessage("");
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

  /*
   * A partir daqui o TypeScript
   * sabe que os parâmetros existem.
   *
   * Essa constante também pode ser
   * usada com segurança dentro das
   * funções internas.
   */
  const currentParameters =
    parameters;

  async function sendQuickCommand(
    nextEnabled: boolean,
    nextSetpoint: number,
  ) {
    if (loading) {
      return;
    }

    const safeSetpoint =
      Math.min(
        28,
        Math.max(
          18,
          nextSetpoint,
        ),
      );

    const targetParameters: DeviceParameters =
      {
        modeDevice:
          currentParameters
            .modeDevice ?? 1,

        modeAC:
          currentParameters
            .modeAC ?? 0,

        fanSpeed:
          currentParameters
            .fanSpeed ?? 1,

        setpointCool:
          nextEnabled
            ? safeSetpoint
            : 0,

        setpointHeat:
          currentParameters
            .setpointHeat ?? 0,

        ecoCool:
          currentParameters
            .ecoCool ?? 25,

        ecoHeat:
          currentParameters
            .ecoHeat ?? 0,
      };

    try {
      setLoading(true);

      setMessage(
        "Enviando...",
      );

      await updateDeviceParameters(
        device.deviceId,
        targetParameters,
      );

      setMessage(
        "Confirmando...",
      );

      const confirmed =
        await waitForDeviceConfirmation(
          device.deviceId,
          targetParameters,
        );

      setEnabled(
        nextEnabled,
      );

      setSetpoint(
        safeSetpoint,
      );

      if (confirmed) {
        setMessage(
          "Confirmado",
        );
      } else {
        setMessage(
          "Comando enviado",
        );
      }

      router.refresh();

      window.setTimeout(
        () => {
          setMessage("");
        },
        2500,
      );
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

  function handleDecrease() {
    if (
      loading ||
      !enabled ||
      setpoint <= 18
    ) {
      return;
    }

    const next =
      setpoint - 1;

    setSetpoint(next);

    void sendQuickCommand(
      true,
      next,
    );
  }

  function handleIncrease() {
    if (
      loading ||
      !enabled ||
      setpoint >= 28
    ) {
      return;
    }

    const next =
      setpoint + 1;

    setSetpoint(next);

    void sendQuickCommand(
      true,
      next,
    );
  }

  function handleToggle() {
    if (loading) {
      return;
    }

    void sendQuickCommand(
      !enabled,
      setpoint,
    );
  }

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Temperatura desejada
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Ajuste rápido
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={
              loading ||
              !enabled ||
              setpoint <= 18
            }
            onClick={
              handleDecrease
            }
            aria-label="Diminuir temperatura"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            −
          </button>

          <div className="flex h-10 min-w-[76px] items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-900">
            {enabled
              ? `${setpoint} °C`
              : "OFF"}
          </div>

          <button
            type="button"
            disabled={
              loading ||
              !enabled ||
              setpoint >= 28
            }
            onClick={
              handleIncrease
            }
            aria-label="Aumentar temperatura"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={
            handleToggle
          }
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            enabled
              ? "bg-red-50 text-red-700 hover:bg-red-100"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {loading
            ? "Enviando..."
            : enabled
              ? "Desligar"
              : "Ligar"}
        </button>

        {message && (
          <span className="text-xs font-medium text-slate-500">
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

function getInitialSetpoint(
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