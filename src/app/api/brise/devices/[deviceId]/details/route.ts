import { NextResponse } from "next/server";
import { briseRequest } from "@/lib/brise-api";

interface RouteContext {
  params: Promise<{
    deviceId: string;
  }>;
}

type EndpointResult =
  | {
      success: true;
      data: unknown;
    }
  | {
      success: false;
      error: string;
    };

async function safelyRequest(endpoint: string): Promise<EndpointResult> {
  try {
    const data = await briseRequest<unknown>(endpoint);

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
          : "Erro desconhecido ao consultar a API.",
    };
  }
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  const { deviceId } = await context.params;

  if (!/^\d+$/.test(deviceId)) {
    return NextResponse.json(
      {
        error: "O número de série do dispositivo é inválido.",
      },
      {
        status: 400,
      },
    );
  }

  const [config, variables, parameters] = await Promise.all([
    safelyRequest(`/device/${deviceId}/configs`),
    safelyRequest(`/device/${deviceId}/variables`),
    safelyRequest(`/device/${deviceId}/parameters`),
  ]);

const safeConfig =
  config.success && typeof config.data === "object" && config.data !== null
    ? (() => {
        const {
          USRID,
          USRPASS,
          ...rest
        } = config.data as Record<string, unknown>;

        return {
          success: true as const,
          data: rest,
        };
      })()
    : config;

return NextResponse.json({
  deviceId: Number(deviceId),
  config: safeConfig,
  variables,
  parameters,
});
}