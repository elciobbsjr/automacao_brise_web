export interface BriseScheduleParameters {
  modeDevice: number;
  modeAC: number;
  fanSpeed: number;

  setpointCool: number;
  setpointHeat: number;

  ecoCool: number;
  ecoHeat: number;
}

export interface BriseSchedule {
  scheduleId: number;

  name: string;
  enable: boolean;

  dateStart: number;
  dateEnd: number;

  repetitionMode: number;
  repetitionValue: number;

  parameter: BriseScheduleParameters;
}

export interface DeviceScheduleResponse {
  deviceId: number;
  success: boolean;

  schedules?: BriseSchedule[];

  error?: string;
}

export interface CreateScheduleRequest {
  deviceIds: number[];

  name: string;
  enable: boolean;

  dateStart: number;
  dateEnd: number;

  repetitionMode: number;
  repetitionValue: number;

  parameter: BriseScheduleParameters;
}

export interface ScheduleBatchResult {
  deviceId: number;
  success: boolean;
  error?: string;
}