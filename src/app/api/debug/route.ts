import { NextResponse } from "next/server";

import {
  briseRequest,
} from "@/lib/brise-api";

function sanitize(
  value: unknown,
): unknown {
  if (
    Array.isArray(value)
  ) {
    return value.map(sanitize);
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const result: Record<
      string,
      unknown
    > = {};

    for (const [
      key,
      item,
    ] of Object.entries(
      value as Record<
        string,
        unknown
      >,
    )) {
      const normalizedKey =
        key.toLowerCase();

      if (
        normalizedKey.includes(
          "password",
        ) ||
        normalizedKey.includes(
          "pass",
        ) ||
        normalizedKey.includes(
          "token",
        ) ||
        normalizedKey.includes(
          "secret",
        ) ||
        normalizedKey.includes(
          "authorization",
        )
      ) {
        result[key] =
          "[OCULTO]";

        continue;
      }

      result[key] =
        sanitize(item);
    }

    return result;
  }

  return value;
}

export async function GET(
  request: Request,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const deviceId =
      searchParams.get(
        "deviceId",
      );

    /*
     * Sem deviceId:
     * mostra a resposta bruta de
     * /user/devices.
     */
    if (!deviceId) {
      const devices =
        await briseRequest<
          unknown
        >(
          "/user/devices",
        );

      return NextResponse.json(
        {
          endpoint:
            "/user/devices",

          data: sanitize(
            devices,
          ),
        },
        {
          status: 200,
        },
      );
    }

    const numericDeviceId =
      Number(deviceId);

    if (
      !Number.isInteger(
        numericDeviceId,
      ) ||
      numericDeviceId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "deviceId inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const [
      configs,
      variables,
      parameters,
      schedules,
    ] = await Promise.allSettled(
      [
        briseRequest<unknown>(
          `/device/${numericDeviceId}/configs`,
        ),

        briseRequest<unknown>(
          `/device/${numericDeviceId}/variables`,
        ),

        briseRequest<unknown>(
          `/device/${numericDeviceId}/parameters`,
        ),

        briseRequest<unknown>(
          `/device/${numericDeviceId}/schedules`,
        ),
      ],
    );

    function getResult(
      result:
        | PromiseSettledResult<unknown>,
    ) {
      if (
        result.status ===
        "fulfilled"
      ) {
        return {
          success: true,
          data: sanitize(
            result.value,
          ),
        };
      }

      return {
        success: false,

        error:
          result.reason instanceof
          Error
            ? result.reason
                .message
            : "Erro desconhecido.",
      };
    }

    return NextResponse.json(
      {
        deviceId:
          numericDeviceId,

        configs:
          getResult(
            configs,
          ),

        variables:
          getResult(
            variables,
          ),

        parameters:
          getResult(
            parameters,
          ),

        schedules:
          getResult(
            schedules,
          ),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Erro desconhecido.",
      },
      {
        status: 500,
      },
    );
  }
}