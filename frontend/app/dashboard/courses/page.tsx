import DashboardShell from "@/components/dashboard/DashboardShell";
import CourseGrid from "@/components/courses/CourseGrid";

export default function CoursesPage() {
  return (
    <DashboardShell title="My Courses" subtitle="Track your enrolled courses and progress.">
      <CourseGrid />
    </DashboardShell>
  );
}
