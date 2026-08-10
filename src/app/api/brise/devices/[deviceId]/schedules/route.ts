import { NextResponse } from "next/server";

import {
  briseRequest,
  BriseApiError,
} from "@/lib/brise-api";

import type {
  BriseSchedule,
  DeviceScheduleResponse,
} from "@/types/schedule";

interface RouteContext {
  params: Promise<{
    deviceId: string;
  }>;
}

interface BriseSchedulesResponse {
  schedules: BriseSchedule[];
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { deviceId } = await context.params;

    if (!/^\d+$/.test(deviceId)) {
      return NextResponse.json(
        {
          error: "Número de série inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const data =
      await briseRequest<BriseSchedulesResponse>(
        `/device/${deviceId}/schedules`,
      );

    const response: DeviceScheduleResponse = {
      deviceId: Number(deviceId),
      success: true,
      schedules: data.schedules ?? [],
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof BriseApiError) {
      return NextResponse.json(
        {
          deviceId: Number(
            new URL(request.url).pathname
              .split("/")
              .at(-2),
          ),
          success: false,
          error: error.message,
          schedules: [],
        },
        {
          status:
            error.status === 204
              ? 503
              : error.status,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        schedules: [],
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