import { NextResponse } from "next/server";

import {
  BriseApiError,
  briseRequest,
} from "@/lib/brise-api";

import type {
  ScheduleBatchResult,
  UpdateScheduleRequest,
} from "@/types/schedule";

export async function PUT(request: Request) {
  try {
    const body =
      (await request.json()) as UpdateScheduleRequest;

    const validationError =
      validateUpdateSchedule(body);

    if (validationError) {
      return NextResponse.json(
        {
          error: validationError,
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
        (result) => result.success,
      ).length;

    const failureCount =
      results.length -
      successCount;

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

async function updateScheduleForDevice(
  deviceId: number,
  schedule: UpdateScheduleRequest,
): Promise<ScheduleBatchResult> {
  try {
    await briseRequest(
      `/device/${deviceId}/schedules/${schedule.scheduleId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
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
      success: true,
    };
  } catch (error) {
    if (
      error instanceof
      BriseApiError
    ) {
      return {
        deviceId,
        success: false,
        error:
          error.message,
      };
    }

    return {
      deviceId,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido.",
    };
  }
}

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
    !body.name ||
    body.name.trim().length === 0
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