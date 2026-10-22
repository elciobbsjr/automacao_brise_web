import {
  NextResponse,
} from "next/server";

import {
  BriseApiError,
  briseRequest,
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
  ScheduleBatchResult,
  UpdateScheduleRequest,
} from "@/types/schedule";

/*
 * =====================================================
 * EDITAR AGENDAMENTO
 * =====================================================
 *
 * Permitido somente para:
 *
 * OPERATOR
 * ADMIN
 */
export async function PUT(
  request: Request,
) {
  const permission =
    await requireApiRole(
      BRISE_CONTROL_ROLES,
    );

  if (!permission.ok) {
    return permission.response;
  }

  try {
    const body =
      (await request.json()) as UpdateScheduleRequest;

    const validationError =
      validateUpdateSchedule(
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

    const results =
      await Promise.all(
        body.deviceIds.map(
          (deviceId) =>
            updateScheduleForDevice(
              deviceId,
              body,
            ),
        ),
      );

    const successCount =
      results.filter(
        (result) =>
          result.success,
      ).length;

    const failureCount =
      results.length -
      successCount;

    /*
     * =================================================
     * AUDITORIA
     * =================================================
     *
     * Só registramos se pelo menos
     * um equipamento tiver sido
     * atualizado com sucesso.
     */
    if (
      successCount > 0
    ) {
      try {
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
            "UPDATE_SCHEDULE",

          resource:
            "SCHEDULE",

          resourceId:
            String(
              body.scheduleId,
            ),

          description:
            `Agendamento "${body.name}" atualizado em ${successCount} equipamento(s).`,

          metadata: {
            scheduleName:
              body.name,

            enabled:
              body.enable,

            deviceIds:
              body.deviceIds,

            successfulDeviceIds:
              results
                .filter(
                  (result) =>
                    result.success,
                )
                .map(
                  (result) =>
                    result.deviceId,
                ),

            failedDeviceIds:
              results
                .filter(
                  (result) =>
                    !result.success,
                )
                .map(
                  (result) =>
                    result.deviceId,
                ),

            successCount,

            failureCount,

            dateStart:
              body.dateStart,

            dateEnd:
              body.dateEnd,

            repetitionMode:
              body.repetitionMode,

            repetitionValue:
              body.repetitionValue,

            parameter: {
              modeDevice:
                body.parameter.modeDevice,

              modeAC:
                body.parameter.modeAC,

              fanSpeed:
                body.parameter.fanSpeed,

              setpointCool:
                body.parameter.setpointCool,

              setpointHeat:
                body.parameter.setpointHeat,

              ecoCool:
                body.parameter.ecoCool,

              ecoHeat:
                body.parameter.ecoHeat,
            },
          },
        });
      } catch (auditError) {
        console.error(
          "Erro ao registrar auditoria de edição de agendamento:",
          auditError,
        );
      }
    }

    return NextResponse.json({
      success:
        failureCount === 0,

      scheduleId:
        body.scheduleId,

      total:
        results.length,

      successCount,

      failureCount,

      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao editar agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================================
 * EDITA AGENDAMENTO EM UM DISPOSITIVO
 * =====================================================
 */
async function updateScheduleForDevice(
  deviceId: number,
  schedule: UpdateScheduleRequest,
): Promise<ScheduleBatchResult> {
  try {
    await briseRequest(
      `/device/${deviceId}/schedules/${schedule.scheduleId}`,
      {
        method:
          "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
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
          }),
      },
    );

    return {
      deviceId,

      success:
        true,
    };
  } catch (error) {
    if (
      error instanceof
      BriseApiError
    ) {
      return {
        deviceId,

        success:
          false,

        error:
          error.message,
      };
    }

    return {
      deviceId,

      success:
        false,

      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido.",
    };
  }
}

/*
 * =====================================================
 * VALIDAÇÃO DA EDIÇÃO
 * =====================================================
 */
function validateUpdateSchedule(
  body: UpdateScheduleRequest,
): string | null {
  if (
    !Number.isInteger(
      body.scheduleId,
    ) ||
    body.scheduleId <= 0
  ) {
    return "ID do agendamento inválido.";
  }

  if (
    !Array.isArray(
      body.deviceIds,
    ) ||
    body.deviceIds.length === 0
  ) {
    return "Selecione pelo menos um dispositivo.";
  }

  if (
    body.deviceIds.some(
      (deviceId) =>
        !Number.isInteger(
          deviceId,
        ) ||
        deviceId <= 0,
    )
  ) {
    return "Existe um dispositivo inválido na seleção.";
  }

  if (
    !body.name ||
    body.name.trim().length ===
      0
  ) {
    return "Informe um nome para o agendamento.";
  }

  if (
    body.name.length > 20
  ) {
    return "O nome do agendamento pode ter no máximo 20 caracteres.";
  }

  if (
    body.dateStart < 0 ||
    body.dateEnd < 0
  ) {
    return "Data do agendamento inválida.";
  }

  if (
    body.dateEnd <
    body.dateStart
  ) {
    return "A data final não pode ser anterior à inicial.";
  }

  const {
    modeDevice,
    modeAC,
    fanSpeed,
    setpointCool,
    setpointHeat,
    ecoCool,
    ecoHeat,
  } = body.parameter;

  if (
    modeDevice < 0 ||
    modeDevice > 3
  ) {
    return "Modo do dispositivo inválido.";
  }

  if (
    modeAC < 0 ||
    modeAC > 3
  ) {
    return "Modo do ar-condicionado inválido.";
  }

  if (
    fanSpeed < 1 ||
    fanSpeed > 3
  ) {
    return "Velocidade inválida.";
  }

  if (
    setpointCool !== 0 &&
    (
      setpointCool < 18 ||
      setpointCool > 28
    )
  ) {
    return "Temperatura de refrigeração inválida.";
  }

  if (
    setpointHeat !== 0 &&
    (
      setpointHeat < 18 ||
      setpointHeat > 28
    )
  ) {
    return "Temperatura de aquecimento inválida.";
  }

  if (
    ecoCool < 18 ||
    ecoCool > 28
  ) {
    return "Temperatura Eco de refrigeração inválida.";
  }

  if (
    ecoHeat !== 0 &&
    (
      ecoHeat < 18 ||
      ecoHeat > 28
    )
  ) {
    return "Temperatura Eco de aquecimento inválida.";
  }

  return null;
}