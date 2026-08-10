import type {
  CreateScheduleRequest,
  ScheduleBatchResult,
  ScheduleListResponse,
  DeleteScheduleResponse,
  ToggleScheduleResponse,
  GroupedSchedule,
} from "@/types/schedule";



interface BatchScheduleResponse {
  success: boolean;
  scheduleId: number;
  total: number;
  successCount: number;
  failureCount: number;
  results: ScheduleBatchResult[];
}

export async function createBatchSchedule(
  schedule: CreateScheduleRequest,
): Promise<BatchScheduleResponse> {
  const response = await fetch(
    "/api/brise/schedules/batch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedule),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Não foi possível criar o agendamento.",
    );
  }

  return result;
}

export async function getSchedules(): Promise<ScheduleListResponse> {
  const response = await fetch(
    "/api/brise/schedules",
    {
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Não foi possível carregar os agendamentos.",
    );
  }

  return result;
}

export async function deleteBatchSchedule(
  scheduleId: number,
  deviceIds: number[],
): Promise<DeleteScheduleResponse> {
  const response = await fetch(
    "/api/brise/schedules/batch",
    {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        scheduleId,
        deviceIds,
      }),
    },
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Não foi possível excluir o agendamento.",
    );
  }

  return result;
}

export async function toggleBatchSchedule(
  schedule: GroupedSchedule,
  deviceIds: number[],
  enable: boolean,
): Promise<ToggleScheduleResponse> {
  const response = await fetch(
    "/api/brise/schedules/batch",
    {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        schedule,
        deviceIds,
        enable,
      }),
    },
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Não foi possível alterar o agendamento.",
    );
  }

  return result;
}