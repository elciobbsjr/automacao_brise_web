/**
 * Dados de configuração do dispositivo
 */
export interface BriseConfig {
  model: string;
  name: string;
  timeZone: number;

  groupLevel1: string;
  groupLevel2: string;
  groupLevel3: string;
  groupLevel4: string;

  btu: number;

  logDay: number;
  pulseKw: number;

  enableFan: boolean;
  enableHeat: boolean;

  dnd: boolean;
}

/**
 * Leituras atuais do equipamento
 */
export interface BriseReading {
  state: boolean;

  temperature: number;
  humidity: number;

  consumption: number;
  consumptionEstimated: number;

  wm?: number;
  on?: number;
  off?: number;
  acc?: number;
}

/**
 * Estado operacional do equipamento
 */
export interface BriseOperation {
  modeDevice: number;
  modeAC: number;

  fanSpeed: number;

  setpointCool: number;
  setpointHeat: number;

  ecoCool: number;
  ecoHeat: number;
}

/**
 * Dispositivo completo
 */
export interface BriseDevice {
  id: number;

  config: BriseConfig;

  reading: BriseReading;

  operation: BriseOperation;
}