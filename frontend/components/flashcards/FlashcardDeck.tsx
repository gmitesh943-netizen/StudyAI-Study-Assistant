"use client";

import { useState } from "react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, type Flashcard } from "@/lib/api";
import { DEMO_FLASHCARDS } from "@/lib/demo-data";
import { useToast } from "@/hooks/useToast";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  BookOpen,
  RefreshCw,
  ArrowRight,
  Check,
  AlertTriangle
} from "lucide-react";

export default function FlashcardDeck() {
  const { getToken } = useAppAuth();
  const { addToast } = useToast();
  const [topic, setTopic] = useState("Biology");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  // Spaced repetition tracking states
  const [masteredIds, setMasteredIds] = useState<number[]>([]);
  const [needsReviewIds, setNeedsReviewIds] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const generate = async () => {
    setLoading(true);
    setCompleted(false);
    setMasteredIds([]);
    setNeedsReviewIds([]);
    try {
      const token = await getToken();
      const res = await api.generateFlashcards(topic, 8, token ?? undefined);
      setCards(res.cards);
      setOriginalCards(res.cards);
      setIndex(0);
      setFlipped(false);
      addToast("Flashcards generated!", "success");
    } catch {
      setCards(DEMO_FLASHCARDS);
      setOriginalCards(DEMO_FLASHCARDS);
      setIndex(0);
      setFlipped(false);
      addToast("Using demo flashcards — API unavailable", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (cardId: number, isMastered: boolean) => {
    if (isMastered) {
      setMasteredIds((prev) => [...new Set([...prev, cardId])]);
      setNeedsReviewIds((prev) => prev.filter((id) => id !== cardId));
    } else {
      setNeedsReviewIds((prev) => [...new Set([...prev, cardId])]);
      setMasteredIds((prev) => prev.filter((id) => id !== cardId));
    }

    // Auto-advance to next card or finish deck after a short delay
    setTimeout(() => {
      if (index < cards.length - 1) {
        setIndex((i) => i + 1);
        setFlipped(false);
      } else {
        setCompleted(true);
      }
    }, 300);
  };

  const nextCard = () => {
    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  const prevCard = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setFlipped(false);
    }
  };

  const finishDeck = () => {
    setCompleted(true);
  };

  const restartEntireDeck = () => {
    setCards(originalCards);
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    setMasteredIds([]);
    setNeedsReviewIds([]);
  };

  const reviewWeakCards = () => {
    const weakCards = originalCards.filter((c) => needsReviewIds.includes(c.id));
    setCards(weakCards);
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    setMasteredIds([]);
    setNeedsReviewIds([]);
  };

  const resetToStart = () => {
    setCards([]);
    setOriginalCards([]);
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    setMasteredIds([]);
    setNeedsReviewIds([]);
  };

  const card = cards[index];

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full px-1">
      {cards.length === 0 ? (
        <Card className="p-8 border border-border/80 shadow-xl bg-card rounded-3xl relative overflow-hidden">
          {/* Subtle background gradient design token */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl -z-10" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-foreground">Generate Study Flashcards</h2>
              <p className="text-sm text-muted">Enter any topic to generate AI flashcards</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Topic / Subject</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Database Normalization, World War II..."
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>
            
            <Button onClick={generate} disabled={loading} className="w-full py-3.5 text-sm font-semibold rounded-2xl shadow-lg">
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating Cards...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Generate Flashcards
                </span>
              )}
            </Button>
          </div>
        </Card>
      ) : completed ? (
        <Card className="p-8 border border-border/80 shadow-xl bg-card rounded-3xl text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
          
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          
          <h2 className="font-bold text-2xl text-foreground mb-2">Deck Completed! 🎉</h2>
          <p className="text-sm text-muted mb-8">Excellent effort! You have reviewed all the cards in this deck.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 dark:bg-green-950/10 dark:border-green-950 text-center">
              <span className="block text-2xl font-bold text-green-600 dark:text-green-400">{masteredIds.length}</span>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Mastered</span>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 dark:bg-red-950/10 dark:border-red-950 text-center">
              <span className="block text-2xl font-bold text-red-600 dark:text-red-400">{needsReviewIds.length}</span>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Need Review</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {needsReviewIds.length > 0 && (
              <Button onClick={reviewWeakCards} className="w-full py-3 text-sm font-semibold rounded-2xl shadow-md bg-primary hover:bg-red-600">
                Review Weak Cards ({needsReviewIds.length})
              </Button>
            )}
            <Button variant="outline" onClick={restartEntireDeck} className="w-full py-3 text-sm font-semibold rounded-2xl">
              Restart Entire Deck
            </Button>
            <button
              onClick={resetToStart}
              className="block w-full text-center text-sm font-semibold text-primary hover:underline pt-2"
            >
              Generate New Topic
            </button>
          </div>
        </Card>
      ) : card ? (
        <>
          {/* Progress bar and statistics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted px-1">
              <span>Card {index + 1} of {cards.length}</span>
              <span className="text-primary bg-primary/10 px-2.5 py-1 rounded-full text-xs font-bold">{card.subject || topic}</span>
            </div>
            <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${((index) / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard container */}
          <div
            className="perspective-1000 cursor-pointer h-72 sm:h-96 relative w-full"
            onClick={() => setFlipped(!flipped)}
            style={{ perspective: "1000px" }}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full h-full"
            >
              {/* Front of Card */}
              <Card
                className="absolute inset-0 flex flex-col justify-between p-8 bg-gradient-to-br from-card to-background border border-border/80 shadow-2xl rounded-3xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted/80">
                  <span>Front</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Question</span>
                </div>
                
                <div className="flex-1 flex items-center justify-center py-4">
                  <h3 className="text-2xl font-bold tracking-tight text-center text-foreground max-h-48 overflow-y-auto px-2 select-none leading-snug">
                    {card.front}
                  </h3>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-muted/70 font-medium select-none">
                  <RotateCcw className="h-3.5 w-3.5 animate-pulse" /> Click anywhere to flip
                </div>
              </Card>

              {/* Back of Card */}
              <Card
                className="absolute inset-0 flex flex-col justify-between p-8 bg-gradient-to-br from-primary/5 to-card border-2 border-primary/20 shadow-2xl rounded-3xl"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Back</span>
                  <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Definition / Answer</span>
                </div>
                
                <div className="flex-1 flex items-center justify-center py-4">
                  <p className="text-lg leading-relaxed text-center text-foreground max-h-48 overflow-y-auto px-2 select-none font-medium">
                    {card.back}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-primary/70 font-medium select-none">
                  <RotateCcw className="h-3.5 w-3.5" /> Click anywhere to flip back
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Spaced Repetition self rating options */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRate(card.id, false);
              }}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] dark:border-red-950 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 text-sm shadow-sm cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4" /> Needs Review
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRate(card.id, true);
              }}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-green-200 bg-green-50/50 hover:bg-green-50 text-green-600 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] dark:border-green-950 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 text-sm shadow-sm cursor-pointer"
            >
              <Check className="h-4 w-4" /> Mastered
            </button>
          </div>

          {/* Standard Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevCard}
              disabled={index === 0}
              className="rounded-xl px-4 py-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            
            <button
              onClick={() => setFlipped(!flipped)}
              className="text-sm font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Flip Card
            </button>

            {index === cards.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={finishDeck}
                className="rounded-xl px-4 py-2 font-semibold bg-primary hover:bg-red-600"
              >
                Finish <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={nextCard}
                className="rounded-xl px-4 py-2"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          <button
            onClick={resetToStart}
            className="w-full text-center text-xs font-semibold text-muted hover:text-primary transition-colors py-2 cursor-pointer"
          >
            ← Return to Topic Selection
          </button>
        </>
      ) : null}
    </div>
  );
}
