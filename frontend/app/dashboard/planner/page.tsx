import DashboardShell from "@/components/dashboard/DashboardShell";
import StudyPlanner from "@/components/planner/StudyPlanner";

export default function PlannerPage() {
  return (
    <DashboardShell title="Study Planner" subtitle="AI-crafted daily study schedules.">
      <StudyPlanner />
    </DashboardShell>
  );
}
