export interface DeviceParameters {
  modeDevice: number;
  modeAC: number;
  fanSpeed: number;
  setpointCool: number;
  setpointHeat: number;
  ecoCool: number;
  ecoHeat: number;
}

export type ControlStatus =
  | "idle"
  | "sending"
  | "waiting"
  | "confirmed"
  | "warning"
  | "error";