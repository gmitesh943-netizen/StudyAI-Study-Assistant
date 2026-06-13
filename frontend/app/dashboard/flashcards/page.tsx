import DashboardShell from "@/components/dashboard/DashboardShell";
import FlashcardDeck from "@/components/flashcards/FlashcardDeck";

export default function FlashcardsPage() {
  return (
    <DashboardShell title="Flashcards" subtitle="AI-generated flashcards with spaced repetition.">
      <FlashcardDeck />
    </DashboardShell>
  );
}
