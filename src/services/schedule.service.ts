import type {
  CreateScheduleRequest,
  ScheduleBatchResult,
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