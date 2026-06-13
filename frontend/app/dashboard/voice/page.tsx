import DashboardShell from "@/components/dashboard/DashboardShell";
import VoiceAssistant from "@/components/voice/VoiceAssistant";

export default function VoicePage() {
  return (
    <DashboardShell title="Voice Assistant" subtitle="Study hands-free with voice commands.">
      <VoiceAssistant />
    </DashboardShell>
  );
}
