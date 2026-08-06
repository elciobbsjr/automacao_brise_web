import { NextResponse } from "next/server";
import { briseRequest } from "@/lib/brise-api";

interface ApiDevice {
  deviceId: number;
}

interface DevicesResponse {
  devices: ApiDevice[];
}

type RequestResult =
  | {
      success: true;
      data: Record<string, unknown>;
    }
  | {
      success: false;
      error: string;
    };

async function safelyRequest(endpoint: string): Promise<RequestResult> {
  try {
    const data = await briseRequest<Record<string, unknown>>(endpoint);

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao consultar a API Brise.",
    };
  }
}

async function getDeviceDetails(deviceId: number) {
  const [config, variables, parameters] = await Promise.all([
    safelyRequest(`/device/${deviceId}/configs`),
    safelyRequest(`/device/${deviceId}/variables`),
    safelyRequest(`/device/${deviceId}/parameters`),
  ]);

  const safeConfig = config.success
    ? (() => {
        const { USRID, USRPASS, ...rest } = config.data;
        return rest;
      })()
    : null;

  return {
    deviceId,
    online: config.success || variables.success || parameters.success,
    config: safeConfig,
    variables: variables.success ? variables.data : null,
    parameters: parameters.success ? parameters.data : null,
    errors: {
      config: config.success ? null : config.error,
      variables: variables.success ? null : variables.error,
      parameters: parameters.success ? null : parameters.error,
    },
  };
}

export async function GET() {
  try {
    const data = await briseRequest<DevicesResponse>("/user/devices");

    const devices = await Promise.all(
      data.devices.map((device) => getDeviceDetails(device.deviceId)),
    );

    return NextResponse.json({
      total: devices.length,
      online: devices.filter((device) => device.online).length,
      offline: devices.filter((device) => !device.online).length,
      devices,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao carregar o painel.";

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