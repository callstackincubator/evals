import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { loadDashboardData } from "@/lib/data/load-data";

export default function Page() {
  const data = loadDashboardData();

  return <DashboardShell data={data} />;
}
