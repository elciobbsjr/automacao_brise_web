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
  BriseSchedule,
  CreateScheduleRequest,
  DeleteScheduleRequest,
  ScheduleBatchResult,
  ToggleScheduleRequest,
} from "@/types/schedule";

/*
 * =====================================================
 * CRIAR AGENDAMENTO
 * =====================================================
 *
 * Permitido somente para:
 *
 * OPERATOR
 * ADMIN
 */
export async function POST(
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
      (await request.json()) as CreateScheduleRequest;

    const validationError =
      validateScheduleRequest(
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

    const scheduleId =
      Math.floor(
        Date.now() / 1000,
      );

    const schedule:
      BriseSchedule = {
        scheduleId,

        name:
          body.name,

        enable:
          body.enable,

        dateStart:
          body.dateStart,

        dateEnd:
          body.dateEnd,

        repetitionMode:
          body.repetitionMode,

        repetitionValue:
          body.repetitionValue,

        parameter:
          body.parameter,
      };

    const results =
      await Promise.all(
        body.deviceIds.map(
          (deviceId) =>
            createScheduleForDevice(
              deviceId,
              schedule,
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
            "CREATE_SCHEDULE",

          resource:
            "SCHEDULE",

          resourceId:
            String(
              scheduleId,
            ),

          description:
            `Agendamento "${schedule.name}" criado em ${successCount} equipamento(s).`,

          metadata: {
            scheduleName:
              schedule.name,

            enabled:
              schedule.enable,

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
              schedule.dateStart,

            dateEnd:
              schedule.dateEnd,

            repetitionMode:
              schedule.repetitionMode,

            repetitionValue:
              schedule.repetitionValue,

            parameter: {
              modeDevice:
                schedule.parameter.modeDevice,

              modeAC:
                schedule.parameter.modeAC,

              fanSpeed:
                schedule.parameter.fanSpeed,

              setpointCool:
                schedule.parameter.setpointCool,

              setpointHeat:
                schedule.parameter.setpointHeat,

              ecoCool:
                schedule.parameter.ecoCool,

              ecoHeat:
                schedule.parameter.ecoHeat,
            },
          },
        });
      } catch (auditError) {
        console.error(
          "Erro ao registrar auditoria de criação de agendamento:",
          auditError,
        );
      }
    }

    return NextResponse.json({
      success:
        failureCount === 0,

      scheduleId,

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
            : "Erro desconhecido ao criar agendamentos.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================================
 * EXCLUIR AGENDAMENTO
 * =====================================================
 */
export async function DELETE(
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
      (await request.json()) as DeleteScheduleRequest;

    if (
      !Number.isInteger(
        body.scheduleId,
      ) ||
      body.scheduleId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "ID do agendamento inválido.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Array.isArray(
        body.deviceIds,
      ) ||
      body.deviceIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Selecione pelo menos um dispositivo.",
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
            deleteScheduleFromDevice(
              deviceId,
              body.scheduleId,
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
     * AUDITORIA
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
            "DELETE_SCHEDULE",

          resource:
            "SCHEDULE",

          resourceId:
            String(
              body.scheduleId,
            ),

          description:
            `Agendamento ${body.scheduleId} excluído de ${successCount} equipamento(s).`,

          metadata: {
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
          },
        });
      } catch (auditError) {
        console.error(
          "Erro ao registrar auditoria de exclusão de agendamento:",
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
            : "Erro desconhecido ao excluir agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================================
 * CRIA AGENDAMENTO EM UM DISPOSITIVO
 * =====================================================
 */
async function createScheduleForDevice(
  deviceId: number,
  schedule: BriseSchedule,
): Promise<ScheduleBatchResult> {
  try {
    await briseRequest(
      `/device/${deviceId}/schedules`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            schedule,
          ),
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
 * VALIDAÇÃO DE NOVO AGENDAMENTO
 * =====================================================
 */
function validateScheduleRequest(
  body: CreateScheduleRequest,
): string | null {
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
    !Number.isInteger(
      body.repetitionMode,
    ) ||
    body.repetitionMode < 0 ||
    body.repetitionMode > 4
  ) {
    return "Modo de repetição inválido.";
  }

  if (
    body.dateStart < 0 ||
    body.dateEnd < 0
  ) {
    return "As datas do agendamento são inválidas.";
  }

  if (
    body.dateEnd <
    body.dateStart
  ) {
    return "A data final não pode ser anterior à data inicial.";
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
    return "Velocidade do ventilador inválida.";
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

/*
 * =====================================================
 * EXCLUI AGENDAMENTO DE UM DISPOSITIVO
 * =====================================================
 */
async function deleteScheduleFromDevice(
  deviceId: number,
  scheduleId: number,
): Promise<ScheduleBatchResult> {
  try {
    await briseRequest(
      `/device/${deviceId}/schedules/${scheduleId}`,
      {
        method:
          "DELETE",
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
 * ATIVAR / DESATIVAR AGENDAMENTO
 * =====================================================
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
      (await request.json()) as ToggleScheduleRequest;

    if (
      !body.schedule ||
      !Number.isInteger(
        body.schedule.scheduleId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Agendamento inválido.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Array.isArray(
        body.deviceIds,
      ) ||
      body.deviceIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Selecione pelo menos um dispositivo.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof body.enable !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "Estado do agendamento inválido.",
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
            updateScheduleState(
              deviceId,
              body.schedule,
              body.enable,
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
     * AUDITORIA
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
            body.enable
              ? "ACTIVATE_SCHEDULE"
              : "DEACTIVATE_SCHEDULE",

          resource:
            "SCHEDULE",

          resourceId:
            String(
              body.schedule.scheduleId,
            ),

          description:
            body.enable
              ? `Agendamento "${body.schedule.name}" ativado em ${successCount} equipamento(s).`
              : `Agendamento "${body.schedule.name}" desativado em ${successCount} equipamento(s).`,

          metadata: {
            scheduleName:
              body.schedule.name,

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
          },
        });
      } catch (auditError) {
        console.error(
          "Erro ao registrar auditoria de status de agendamento:",
          auditError,
        );
      }
    }

    return NextResponse.json({
      success:
        failureCount === 0,

      scheduleId:
        body.schedule.scheduleId,

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
            : "Erro desconhecido ao alterar agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================================
 * ALTERA ESTADO DO AGENDAMENTO
 * EM UM DISPOSITIVO
 * =====================================================
 */
async function updateScheduleState(
  deviceId: number,
  schedule:
    ToggleScheduleRequest["schedule"],
  enable: boolean,
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

            enable,

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