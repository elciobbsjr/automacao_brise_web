import { NextResponse } from "next/server";
import { briseRequest, BriseApiError } from "@/lib/brise-api";

interface BriseApiDevice {
  deviceId: number;
  deviceUser?: string;
  devicePassword?: string;
}

interface BriseDevicesResponse {
  devices: BriseApiDevice[];
}

export async function GET() {
  try {
    const data = await briseRequest<BriseDevicesResponse>("/user/devices");

    const devices = data.devices.map((device) => ({
      deviceId: device.deviceId,
    }));

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Erro ao consultar dispositivos Brise:", error);

    if (error instanceof BriseApiError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
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