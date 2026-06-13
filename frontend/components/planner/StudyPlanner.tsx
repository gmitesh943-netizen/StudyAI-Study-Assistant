"use client";

import { useState } from "react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, type StudyBlock } from "@/lib/api";
import { DEMO_PLAN } from "@/lib/demo-data";
import { useToast } from "@/hooks/useToast";
import { Calendar, Clock, BookOpen } from "lucide-react";

export default function StudyPlanner() {
  const { getToken } = useAppAuth();
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState("Mathematics, Physics, Chemistry");
  const [hours, setHours] = useState(4);
  const [schedule, setSchedule] = useState<StudyBlock[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const subjectList = subjects.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      const token = await getToken();
      const res = await api.generatePlan(subjectList, hours, token ?? undefined);
      setSchedule(res.schedule);
      addToast("Study plan generated!", "success");
    } catch {
      setSchedule(DEMO_PLAN);
      addToast("Using demo plan — API unavailable", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">Create Study Plan</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Subjects (comma-separated)</label>
            <input
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Hours per day</label>
            <input
              type="number"
              min={1}
              max={12}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <Button onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Plan"}
        </Button>
      </Card>

      {schedule.length > 0 && (
        <div className="space-y-3">
          {schedule.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 px-3 py-2 text-center shrink-0">
                  <Clock className="h-4 w-4 text-primary mx-auto" />
                  <span className="text-sm font-bold text-primary">{block.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-bold">{block.subject}</span>
                    <span className="text-xs text-muted ml-auto">{block.duration}</span>
                  </div>
                  <p className="text-sm text-muted">{block.task}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
