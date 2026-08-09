export interface DashboardDevice {
  deviceId: number;
  online: boolean;

  config: {
    MODEL?: string;
    name?: string;
    btu?: number;
    timeZone?: number;

    groupLevel1?: string;
    groupLevel2?: string;
    groupLevel3?: string;
    groupLevel4?: string;

    logDay?: number;
    pulseKw?: number;

    enableFan?: boolean;
    enableHeat?: boolean;
    dnd?: boolean;
  } | null;

  variables: {
    WM?: number;
    OFF?: number;
    ON?: number;
    ACC?: number;

    temperature?: number;
    humidity?: number;

    consumption?: number;
    consumptionEstimated?: number;

    state?: boolean;
  } | null;

  parameters: {
    modeDevice?: number;
    modeAC?: number;
    fanSpeed?: number;

    setpointCool?: number;
    setpointHeat?: number;

    ecoCool?: number;
    ecoHeat?: number;
  } | null;
}

export interface DashboardResponse {
  total: number;
  online: number;
  offline: number;
  devices: DashboardDevice[];
}