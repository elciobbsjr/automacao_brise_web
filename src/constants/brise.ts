export const DEVICE_MODES: Record<number, string> = {
  0: "Desligado",
  1: "Manual",
  2: "Absoluto",
  3: "Eco",
};

export const AC_MODES: Record<number, string> = {
  0: "Refrigeração",
  1: "Aquecimento",
  2: "Automático",
  3: "Ventilação",
};

export const FAN_SPEEDS: Record<number, string> = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
};

export const DEVICE_STATUS: Record<string, string> = {
  true: "Ligado",
  false: "Desligado",
};

export const DEFAULT_DEVICE_LABEL = "Dispositivo sem nome";

export const API_REFRESH_INTERVAL = 30_000;