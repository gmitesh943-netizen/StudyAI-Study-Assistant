import DashboardShell from "@/components/dashboard/DashboardShell";
import ChatInterface from "@/components/ai/ChatInterface";

export default function AITutorPage() {
  return (
    <DashboardShell title="AI Tutor" subtitle="Ask questions and get step-by-step explanations.">
      <ChatInterface />
    </DashboardShell>
  );
}
