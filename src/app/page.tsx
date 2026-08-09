import { AutoRefresh } from "@/components/dashboard/AutoRefresh";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { DashboardDevices } from "@/components/dashboard/DashboardDevices";
import { getDashboard } from "@/services/brise.service";

export default async function Home() {
  const dashboard = await getDashboard();

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
      <AutoRefresh />

      <div className="mx-auto max-w-7xl">
        <DashboardHeader />

        <DashboardSummary dashboard={dashboard} />

        <DashboardDevices devices={dashboard.devices} />

      </div>
    </main>
  );
}