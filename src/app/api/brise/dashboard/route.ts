import { NextResponse } from "next/server";

import {
  briseRequest,
} from "@/lib/brise-api";

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

const CONCURRENCY_LIMIT = 4;

async function safelyRequest(
  endpoint: string,
): Promise<RequestResult> {
  try {
    const data =
      await briseRequest<
        Record<string, unknown>
      >(endpoint);

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

async function getDeviceDetails(
  deviceId: number,
) {
  const [
    config,
    variables,
    parameters,
  ] = await Promise.all([
    safelyRequest(
      `/device/${deviceId}/configs`,
    ),

    safelyRequest(
      `/device/${deviceId}/variables`,
    ),

    safelyRequest(
      `/device/${deviceId}/parameters`,
    ),
  ]);

  const safeConfig =
    config.success
      ? (() => {
          const {
            USRID,
            USRPASS,
            ...rest
          } = config.data;

          return rest;
        })()
      : null;

  return {
    deviceId,

    online:
      config.success ||
      variables.success ||
      parameters.success,

    config:
      safeConfig,

    variables:
      variables.success
        ? variables.data
        : null,

    parameters:
      parameters.success
        ? parameters.data
        : null,

    errors: {
      config:
        config.success
          ? null
          : config.error,

      variables:
        variables.success
          ? null
          : variables.error,

      parameters:
        parameters.success
          ? null
          : parameters.error,
    },
  };
}

async function processWithConcurrencyLimit<
  T,
  R,
>(
  items: T[],
  limit: number,
  worker: (
    item: T,
  ) => Promise<R>,
): Promise<R[]> {
  const results: R[] =
    new Array(items.length);

  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const currentIndex =
        nextIndex;

      if (
        currentIndex >=
        items.length
      ) {
        return;
      }

      nextIndex += 1;

      results[currentIndex] =
        await worker(
          items[currentIndex],
        );
    }
  }

  const workerCount =
    Math.min(
      limit,
      items.length,
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },

      () => runWorker(),
    ),
  );

  return results;
}

export async function GET() {
  try {
    const data =
      await briseRequest<
        DevicesResponse
      >(
        "/user/devices",
      );

    if (
      !Array.isArray(
        data.devices,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A API Brise retornou uma lista de dispositivos inválida.",
        },
        {
          status: 502,
        },
      );
    }

    const devices =
      await processWithConcurrencyLimit(
        data.devices,
        CONCURRENCY_LIMIT,

        (device) =>
          getDeviceDetails(
            device.deviceId,
          ),
      );

    const online =
      devices.filter(
        (device) =>
          device.online,
      ).length;

    const offline =
      devices.length -
      online;

    return NextResponse.json({
      total:
        devices.length,

      online,

      offline,

      devices,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao carregar o painel.";

    console.error(
      "Erro na rota do dashboard:",
      error,
    );

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