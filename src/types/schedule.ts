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

export interface GroupedSchedule {
  scheduleId: number;

  name: string;
  enable: boolean;

  dateStart: number;
  dateEnd: number;

  repetitionMode: number;
  repetitionValue: number;

  parameter: BriseScheduleParameters;

  deviceIds: number[];
  devicesCount: number;
}

export interface ScheduleListResponse {
  totalDevices: number;
  successDevices: number;
  failedDevices: number;
  totalSchedules: number;

  schedules: GroupedSchedule[];
}

export interface DeleteScheduleRequest {
  scheduleId: number;
  deviceIds: number[];
}

export interface DeleteScheduleResponse {
  success: boolean;
  scheduleId: number;

  total: number;
  successCount: number;
  failureCount: number;

  results: ScheduleBatchResult[];
}


export interface ToggleScheduleRequest {
  schedule: GroupedSchedule;
  deviceIds: number[];
  enable: boolean;
}

export interface ToggleScheduleResponse {
  success: boolean;
  scheduleId: number;

  total: number;
  successCount: number;
  failureCount: number;

  results: ScheduleBatchResult[];
}