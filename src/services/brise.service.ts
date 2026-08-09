import type { DashboardResponse } from "@/types/dashboard";

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await fetch(
    "http://localhost:3000/api/brise/dashboard",
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar os dispositivos.");
  }

  return response.json();
}