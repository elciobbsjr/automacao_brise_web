import { NextResponse } from "next/server";

import {
  briseRequest,
  BriseApiError,
} from "@/lib/brise-api";

import type {
  BriseSchedule,
} from "@/types/schedule";

interface ApiDevice {
  deviceId: number;
}

interface DevicesResponse {
  devices: ApiDevice[];
}

interface SchedulesResponse {
  schedules: BriseSchedule[];
}

interface DeviceScheduleResult {
  deviceId: number;
  success: boolean;
  schedules: BriseSchedule[];
  error?: string;
}

interface GroupedSchedule {
  scheduleId: number;

  name: string;
  enable: boolean;

  dateStart: number;
  dateEnd: number;

  repetitionMode: number;
  repetitionValue: number;

  parameter: BriseSchedule["parameter"];

  deviceIds: number[];

  devicesCount: number;
}

export async function GET() {
  try {
    const data =
      await briseRequest<DevicesResponse>(
        "/user/devices",
      );

    const results =
      await Promise.all(
        data.devices.map((device) =>
          getSchedulesForDevice(
            device.deviceId,
          ),
        ),
      );

    const groupedSchedules =
      groupSchedules(results);

    const successDevices =
      results.filter(
        (result) => result.success,
      ).length;

    const failedDevices =
      results.length -
      successDevices;

    return NextResponse.json({
      totalDevices:
        results.length,

      successDevices,

      failedDevices,

      totalSchedules:
        groupedSchedules.length,

      schedules:
        groupedSchedules,

      devices:
        results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao consultar agendamentos.",
      },
      {
        status: 500,
      },
    );
  }
}

async function getSchedulesForDevice(
  deviceId: number,
): Promise<DeviceScheduleResult> {
  try {
    const data =
      await briseRequest<SchedulesResponse>(
        `/device/${deviceId}/schedules`,
      );

    return {
      deviceId,
      success: true,
      schedules:
        data.schedules ?? [],
    };
  } catch (error) {
    if (
      error instanceof
      BriseApiError
    ) {
      return {
        deviceId,
        success: false,
        schedules: [],
        error:
          error.message,
      };
    }

    return {
      deviceId,
      success: false,
      schedules: [],
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido.",
    };
  }
}

function groupSchedules(
  results: DeviceScheduleResult[],
): GroupedSchedule[] {
  const schedulesMap =
    new Map<
      number,
      GroupedSchedule
    >();

  for (const result of results) {
    if (!result.success) {
      continue;
    }

    for (
      const schedule
      of result.schedules
    ) {
      const existing =
        schedulesMap.get(
          schedule.scheduleId,
        );

      if (existing) {
        if (
          !existing.deviceIds.includes(
            result.deviceId,
          )
        ) {
          existing.deviceIds.push(
            result.deviceId,
          );

          existing.devicesCount =
            existing.deviceIds.length;
        }

        continue;
      }

      schedulesMap.set(
        schedule.scheduleId,
        {
          scheduleId:
            schedule.scheduleId,

          name:
            schedule.name,

          enable:
            schedule.enable,

          dateStart:
            schedule.dateStart,

          dateEnd:
            schedule.dateEnd,

          repetitionMode:
            schedule.repetitionMode,

          repetitionValue:
            schedule.repetitionValue,

          parameter:
            schedule.parameter,

          deviceIds: [
            result.deviceId,
          ],

          devicesCount: 1,
        },
      );
    }
  }

  return Array.from(
    schedulesMap.values(),
  ).sort(
    (a, b) =>
      b.scheduleId -
      a.scheduleId,
  );
}