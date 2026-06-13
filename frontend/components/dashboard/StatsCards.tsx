"use client";

import Card from "@/components/ui/Card";
import { Brain, Clock, Eye, FileText, Layers, Timer } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  study_hours: number;
  quizzes_completed: number;
  flashcards_reviewed: number;
  notes_created: number;
  page_views: number;
  active_minutes: number;
}

const statConfig = [
  { key: "active_minutes" as const, label: "Active Time", icon: Timer, suffix: "m" },
  { key: "page_views" as const, label: "Page Views", icon: Eye, suffix: "" },
  { key: "study_hours" as const, label: "Study Hours", icon: Clock, suffix: "h" },
  { key: "quizzes_completed" as const, label: "Quizzes Done", icon: Brain, suffix: "" },
  { key: "flashcards_reviewed" as const, label: "Flashcards", icon: Layers, suffix: "" },
  { key: "notes_created" as const, label: "Notes Created", icon: FileText, suffix: "" },
];

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statConfig.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">
                    {stats[s.key]?.toLocaleString()}{s.suffix}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
