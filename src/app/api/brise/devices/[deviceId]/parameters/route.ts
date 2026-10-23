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
  BRISE_CONTROL_ROLES,
} from "@/features/auth/permissions/roles";

import {
  createAuditLog,
} from "@/features/audit/services/audit.service";

import type {
  Prisma,
} from "@/generated/prisma/client";

interface RouteContext {
  params: Promise<{
    deviceId: string;
  }>;
}

interface DeviceParameters {
  modeDevice: number;
  modeAC: number;
  fanSpeed: number;
  setpointCool: number;
  setpointHeat: number;
  ecoCool: number;
  ecoHeat: number;
}

type DeviceParameterKey =
  keyof DeviceParameters;


export async function PUT(
  request: Request,
  context: RouteContext,
) {
  const permission =
    await requireApiRole(
      BRISE_CONTROL_ROLES,
    );

  if (!permission.ok) {
    return permission.response;
  }

  try {
    const {
      deviceId,
    } = await context.params;

    if (
      !/^\d+$/.test(
        deviceId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Número de série inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      (await request.json()) as DeviceParameters;

    const validationError =
      validateParameters(
        body,
      );

    if (validationError) {
      return NextResponse.json(
        {
          error:
            validationError,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==========================================
     * ESTADO ANTERIOR
     * ==========================================
     *
     * Antes de enviar o comando, buscamos
     * os parâmetros atuais do equipamento.
     */
    let previousParameters:
      DeviceParameters | null =
      null;

    try {
      previousParameters =
        await briseRequest<DeviceParameters>(
          `/device/${deviceId}/parameters`,
        );
    } catch (error) {
      /*
       * A leitura anterior é importante
       * para o histórico, mas não deve
       * impedir o controle do equipamento.
       */
      console.error(
        "Não foi possível obter os parâmetros anteriores para auditoria:",
        error,
      );
    }

    /*
     * ==========================================
     * IDENTIFICA ALTERAÇÕES
     * ==========================================
     */
    const changes =
      previousParameters
        ? getParameterChanges(
            previousParameters,
            body,
          )
        : null;

    /*
     * ==========================================
     * ENVIA O COMANDO
     * ==========================================
     */
    await briseRequest(
      `/device/${deviceId}/parameters`,
      {
        method:
          "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            body,
          ),
      },
    );

    /*
     * ==========================================
     * AUDITORIA
     * ==========================================
     *
     * Armazenamos apenas os campos
     * realmente alterados.
     */
    try {
      if (
        changes &&
        Object.keys(
          changes,
        ).length > 0
      ) {
        await createAuditLog({
          actor: {
            id:
              permission.user.id,

            name:
              permission.user.name,

            email:
              permission.user.email,
          },

          action:
            "UPDATE_DEVICE_PARAMETERS",

          resource:
            "DEVICE",

          resourceId:
            deviceId,

          description:
            `Parâmetros do equipamento ${deviceId} atualizados.`,

          metadata: {
            changes,
          },
        });
      } else if (
        previousParameters ===
        null
      ) {
        /*
         * Se não foi possível obter
         * o estado anterior, ainda
         * registramos a ação, mas
         * sem inventar diferenças.
         */
        await createAuditLog({
          actor: {
            id:
              permission.user.id,

            name:
              permission.user.name,

            email:
              permission.user.email,
          },

          action:
            "UPDATE_DEVICE_PARAMETERS",

          resource:
            "DEVICE",

          resourceId:
            deviceId,

          description:
            `Parâmetros do equipamento ${deviceId} atualizados.`,

          metadata: {
            comparisonUnavailable:
              true,
          },
        });
      }
    } catch (auditError) {
      console.error(
        "Erro ao registrar auditoria de alteração de parâmetros:",
        auditError,
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Comando enviado com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao alterar parâmetros do Brise:",
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

          briseStatus:
            error.status,
        },
        {
          status:
            error.status ===
            204
              ? 503
              : error.status,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * ==========================================
 * COMPARAÇÃO DOS PARÂMETROS
 * ==========================================
 */
function getParameterChanges(
  previous:
    DeviceParameters,
  next:
    DeviceParameters,
): Prisma.InputJsonObject {
  const keys:
    DeviceParameterKey[] = [
      "modeDevice",
      "modeAC",
      "fanSpeed",
      "setpointCool",
      "setpointHeat",
      "ecoCool",
      "ecoHeat",
    ];

  const changes:
    Record<
      string,
      Prisma.InputJsonValue
    > = {};

  for (
    const key
    of keys
  ) {
    if (
      previous[key] !==
      next[key]
    ) {
      changes[key] = {
        from:
          previous[key],

        to:
          next[key],
      };
    }
  }

  return changes;
}



/*
 * ==========================================
 * VALIDAÇÃO
 * ==========================================
 */
function validateParameters(
  parameters: DeviceParameters,
): string | null {
  const {
    modeDevice,
    modeAC,
    fanSpeed,
    setpointCool,
    setpointHeat,
    ecoCool,
    ecoHeat,
  } = parameters;

  if (
    !Number.isInteger(
      modeDevice,
    ) ||
    modeDevice < 0 ||
    modeDevice > 3
  ) {
    return "Modo do dispositivo inválido.";
  }

  if (
    !Number.isInteger(
      modeAC,
    ) ||
    modeAC < 0 ||
    modeAC > 3
  ) {
    return "Modo do ar-condicionado inválido.";
  }

  if (
    !Number.isInteger(
      fanSpeed,
    ) ||
    fanSpeed < 1 ||
    fanSpeed > 3
  ) {
    return "Velocidade do ventilador inválida.";
  }

  if (
    modeDevice === 3 &&
    modeAC === 3
  ) {
    return "Ventilação não é permitida no modo Eco.";
  }

  if (
    modeAC === 2 &&
    modeDevice !== 3
  ) {
    return "O modo Automático requer modo Eco.";
  }

  if (
    setpointCool !== 0 &&
    (
      setpointCool < 18 ||
      setpointCool > 28
    )
  ) {
    return "Setpoint de refrigeração inválido.";
  }

  if (
    setpointHeat !== 0 &&
    (
      setpointHeat < 18 ||
      setpointHeat > 28
    )
  ) {
    return "Setpoint de aquecimento inválido.";
  }

  if (
    ecoCool < 18 ||
    ecoCool > 28
  ) {
    return "Setpoint Eco de refrigeração inválido.";
  }

  if (
    ecoHeat !== 0 &&
    (
      ecoHeat < 18 ||
      ecoHeat > 28
    )
  ) {
    return "Setpoint Eco de aquecimento inválido.";
  }

  return null;
}