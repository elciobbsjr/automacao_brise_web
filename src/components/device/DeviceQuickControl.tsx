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
    <div>
      {/* ==========================================
          CONTROLE PRINCIPAL
          ========================================== */}

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        {/* TÍTULO */}

        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.11em] text-slate-400">
            Temperatura desejada
          </p>
        </div>

        {/* CONTROLES */}

        <div className="flex shrink-0 items-center gap-1.5">
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 disabled:opacity-60"
          >
            −
          </button>

          <div className="flex h-9 w-[66px] shrink-0 items-center justify-center rounded-xl bg-slate-100 px-2 text-sm font-bold text-slate-900">
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 disabled:opacity-60"
          >
            +
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={
              handleToggle
            }
            className={`flex h-9 w-[82px] shrink-0 items-center justify-center rounded-xl text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              enabled
                ? "border border-red-100 bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100"
                : "border border-emerald-600 bg-emerald-600 text-white shadow-sm hover:border-emerald-700 hover:bg-emerald-700"
            }`}
          >
            {loading
              ? "..."
              : enabled
                ? "Desligar"
                : "Ligar"}
          </button>
        </div>
      </div>

      {/* ==========================================
          FEEDBACK
          ========================================== */}

      {message && (
        <div className="mt-2 flex justify-end">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold ${
              message ===
              "Confirmado"
                ? "bg-emerald-50 text-emerald-700"
                : message ===
                    "Enviando..." ||
                    message ===
                      "Confirmando..."
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {message ===
              "Confirmado" && (
              <CheckIcon />
            )}

            {(message ===
              "Enviando..." ||
              message ===
                "Confirmando...") && (
              <LoadingIcon />
            )}

            {message}
          </span>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   SETPOINT INICIAL
   ========================================== */

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

/* ==========================================
   ÍCONES
   ========================================== */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
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
      className="h-3 w-3 animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}