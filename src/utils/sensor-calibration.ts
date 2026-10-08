import type { DashboardDevice } from "@/types/dashboard";

export type SensorCalibrationStatus =
  | "valid"
  | "invalid"
  | "missing";

export interface SensorCalibrationDiagnostic {
  status: SensorCalibrationStatus;
  needsRecalibration: boolean;
  on: number | null;
  off: number | null;
  reason: string | null;
}

export function getSensorCalibrationDiagnostic(
  device: DashboardDevice,
): SensorCalibrationDiagnostic {
  const on = normalizeSensorValue(
    device.variables?.ON,
  );

  const off = normalizeSensorValue(
    device.variables?.OFF,
  );

  if (on === null || off === null) {
    return {
      status: "missing",
      needsRecalibration: false,
      on,
      off,
      reason: null,
    };
  }

  if (off >= on) {
    return {
      status: "invalid",
      needsRecalibration: true,
      on,
      off,
      reason:
        "A referência desligado (OFF) está maior ou igual à referência ligado (ON).",
    };
  }

  return {
    status: "valid",
    needsRecalibration: false,
    on,
    off,
    reason: null,
  };
}

function normalizeSensorValue(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}