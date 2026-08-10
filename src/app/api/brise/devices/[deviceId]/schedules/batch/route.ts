import { NextResponse } from "next/server";

import {
  briseRequest,
  BriseApiError,
} from "@/lib/brise-api";

import type {
  BriseSchedule,
  CreateScheduleRequest,
  ScheduleBatchResult,
} from "@/types/schedule";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CreateScheduleRequest;

    const validationError =
      validateScheduleRequest(body);

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

    const scheduleId = Date.now();

    const schedule: BriseSchedule = {
      scheduleId,

      name: body.name,
      enable: body.enable,

      dateStart: body.dateStart,
      dateEnd: body.dateEnd,

      repetitionMode: body.repetitionMode,
      repetitionValue: body.repetitionValue,

      parameter: body.parameter,
    };

    const results =
      await Promise.all(
        body.deviceIds.map((deviceId) =>
          createScheduleForDevice(
            deviceId,
            schedule,
          ),
        ),
      );

    const successCount =
      results.filter(
        (result) => result.success,
      ).length;

    const failureCount =
      results.length - successCount;

    return NextResponse.json({
      success:
        failureCount === 0,

      scheduleId,

      total: results.length,
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

async function createScheduleForDevice(
  deviceId: number,
  schedule: BriseSchedule,
): Promise<ScheduleBatchResult> {
  try {
    await briseRequest(
      `/device/${deviceId}/schedules`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(schedule),
      },
    );

    return {
      deviceId,
      success: true,
    };
  } catch (error) {
    if (error instanceof BriseApiError) {
      return {
        deviceId,
        success: false,
        error: error.message,
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

function validateScheduleRequest(
  body: CreateScheduleRequest,
): string | null {
  if (
    !Array.isArray(body.deviceIds) ||
    body.deviceIds.length === 0
  ) {
    return "Selecione pelo menos um dispositivo.";
  }

  if (
    body.deviceIds.some(
      (deviceId) =>
        !Number.isInteger(deviceId) ||
        deviceId <= 0,
    )
  ) {
    return "Existe um dispositivo inválido na seleção.";
  }

  if (
    !body.name ||
    body.name.trim().length === 0
  ) {
    return "Informe um nome para o agendamento.";
  }

  if (body.name.length > 20) {
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