import DashboardShell from "@/components/dashboard/DashboardShell";
import QuizComponent from "@/components/quiz/QuizComponent";

export default function QuizPage() {
  return (
    <DashboardShell title="Quiz Generator" subtitle="Test your knowledge with AI-generated quizzes.">
      <QuizComponent />
    </DashboardShell>
  );
}
