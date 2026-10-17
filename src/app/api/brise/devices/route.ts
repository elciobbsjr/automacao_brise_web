import {
  NextResponse,
} from "next/server";

import {
  briseRequest,
  BriseApiError,
} from "@/lib/brise-api";

import {
  requireApiRole,
} from "@/features/auth/guards/require-api-role";

import {
  BRISE_READ_ROLES,
} from "@/features/auth/permissions/roles";

interface BriseApiDevice {
  deviceId: number;
  deviceUser?: string;
  devicePassword?: string;
}

interface BriseDevicesResponse {
  devices: BriseApiDevice[];
}

export async function GET() {
  const permission =
    await requireApiRole(
      BRISE_READ_ROLES,
    );

  if (!permission.ok) {
    return permission.response;
  }

  try {
    const data =
      await briseRequest<BriseDevicesResponse>(
        "/user/devices",
      );

    const devices =
      data.devices.map(
        (device) => ({
          deviceId:
            device.deviceId,
        }),
      );

    return NextResponse.json({
      devices,
    });
  } catch (error) {
    console.error(
      "Erro ao consultar dispositivos Brise:",
      error,
    );

    if (
      error instanceof
      BriseApiError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.status,
        },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao consultar a API Brise.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}