import type {
  DashboardDevice,
} from "@/types/dashboard";

export type DeviceDetectedState =
  | "on"
  | "off"
  | "unknown";

export type DeviceMovementState =
  | "absence"
  | "unknown";

export type DeviceShutdownReason =
  | "absence"
  | "device_on"
  | "unknown";

export interface AccelerometerDiagnostic {
  acc: number | null;
  onReference: number | null;
  offReference: number | null;

  distanceToOn: number | null;
  distanceToOff: number | null;

  detectedState:
    DeviceDetectedState;
}

export interface DeviceStateDiagnostic {
  /*
   * Estado informado diretamente
   * pela API Brise.
   */
  logicalState:
    DeviceDetectedState;

  /*
   * Estado físico detectado
   * pelo acelerômetro.
   */
  physicalState:
    DeviceDetectedState;

  /*
   * Indica se o estado informado
   * pelo Brise diverge do estado
   * físico detectado.
   */
  divergent: boolean;

  accelerometer:
    AccelerometerDiagnostic;

  /*
   * Valor bruto de WM.
   */
  wm: number | null;

  /*
   * Interpretação conhecida do WM.
   *
   * Por enquanto:
   *
   * WM = 0
   * → ausência de movimento.
   *
   * Outros valores continuam
   * não mapeados.
   */
  movementState:
    DeviceMovementState;

  /*
   * Motivo identificado para
   * o equipamento estar desligado.
   */
  shutdownReason:
    DeviceShutdownReason;
}

/*
 * Regra informada pelo fabricante:
 *
 * ACC é comparado com ON e OFF.
 *
 * A referência mais próxima
 * determina o estado físico.
 */
export function getAccelerometerState(
  acc: number,
  onReference: number,
  offReference: number,
): DeviceDetectedState {
  if (
    !Number.isFinite(acc) ||
    !Number.isFinite(
      onReference,
    ) ||
    !Number.isFinite(
      offReference,
    )
  ) {
    return "unknown";
  }

  const distanceToOn =
    Math.abs(
      acc - onReference,
    );

  const distanceToOff =
    Math.abs(
      acc - offReference,
    );

  if (
    distanceToOn <
    distanceToOff
  ) {
    return "on";
  }

  if (
    distanceToOff <
    distanceToOn
  ) {
    return "off";
  }

  return "unknown";
}

/*
 * Diagnóstico completo
 * do acelerômetro.
 */
export function getAccelerometerDiagnostic(
  acc: number | null,
  onReference: number | null,
  offReference: number | null,
): AccelerometerDiagnostic {
  if (
    acc === null ||
    onReference === null ||
    offReference === null
  ) {
    return {
      acc,
      onReference,
      offReference,

      distanceToOn: null,
      distanceToOff: null,

      detectedState:
        "unknown",
    };
  }

  const distanceToOn =
    Math.abs(
      acc - onReference,
    );

  const distanceToOff =
    Math.abs(
      acc - offReference,
    );

  return {
    acc,
    onReference,
    offReference,

    distanceToOn,
    distanceToOff,

    detectedState:
      getAccelerometerState(
        acc,
        onReference,
        offReference,
      ),
  };
}

/*
 * Diagnóstico completo
 * de um dispositivo.
 */
export function getDeviceStateDiagnostic(
  device: DashboardDevice,
): DeviceStateDiagnostic {
  const variables =
    device.variables as
      | Record<
          string,
          unknown
        >
      | null
      | undefined;

  const acc =
    getNumberValue(
      variables?.ACC,
    );

  const onReference =
    getNumberValue(
      variables?.ON,
    );

  const offReference =
    getNumberValue(
      variables?.OFF,
    );

  const wm =
    getNumberValue(
      variables?.WM,
    );

  const accelerometer =
    getAccelerometerDiagnostic(
      acc,
      onReference,
      offReference,
    );

  const logicalState =
    getLogicalState(
      variables?.state,
    );

  const physicalState =
    accelerometer.detectedState;

  const divergent =
    logicalState !==
      "unknown" &&
    physicalState !==
      "unknown" &&
    logicalState !==
      physicalState;

  /*
   * Regra já confirmada:
   *
   * WM = 0
   * → ausência de movimento.
   *
   * Para qualquer outro valor,
   * ainda não sabemos exatamente
   * o significado.
   */
  const movementState:
    DeviceMovementState =
      wm === 0
        ? "absence"
        : "unknown";

  /*
   * Só afirmamos que o equipamento
   * foi desligado por ausência quando:
   *
   * WM = 0
   * E
   * state = false
   */
  let shutdownReason:
    DeviceShutdownReason =
      "unknown";

  if (
    logicalState === "on"
  ) {
    shutdownReason =
      "device_on";
  } else if (
    logicalState === "off" &&
    movementState ===
      "absence"
  ) {
    shutdownReason =
      "absence";
  }

  return {
    logicalState,
    physicalState,
    divergent,

    accelerometer,

    wm,
    movementState,
    shutdownReason,
  };
}

/*
 * Estado lógico informado
 * pela API.
 */
function getLogicalState(
  value: unknown,
): DeviceDetectedState {
  if (value === true) {
    return "on";
  }

  if (value === false) {
    return "off";
  }

  return "unknown";
}

/*
 * Conversão segura dos números
 * recebidos pela API.
 */
function getNumberValue(
  value: unknown,
): number | null {
  if (
    typeof value !==
    "number"
  ) {
    return null;
  }

  if (
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

/*
 * Formatadores para a interface.
 */
export function formatDetectedState(
  state: DeviceDetectedState,
) {
  switch (state) {
    case "on":
      return "Ligado";

    case "off":
      return "Desligado";

    default:
      return "Indeterminado";
  }
}

export function formatMovementState(
  state: DeviceMovementState,
) {
  switch (state) {
    case "absence":
      return "Ausência detectada";

    default:
      return "Não mapeado";
  }
}

export function formatShutdownReason(
  reason: DeviceShutdownReason,
) {
  switch (reason) {
    case "absence":
      return "Ausência de movimento";

    case "device_on":
      return "Equipamento ligado";

    default:
      return "Não identificado";
  }
}