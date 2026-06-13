"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How does the AI tutor work?",
    a: "Our AI tutor uses advanced language models trained on educational content. It provides step-by-step explanations, adapts to your learning level, and can help with any subject from math to medicine.",
  },
  {
    q: "Can I upload my own study materials?",
    a: "Yes! Upload PDFs, textbooks, or lecture notes and our AI will generate summaries, key points, flashcards, and practice questions automatically.",
  },
  {
    q: "Is there a free plan?",
    a: "Absolutely. The free plan includes 5 AI chats per day, basic flashcards, and one quiz per week. No credit card required.",
  },
  {
    q: "Does StudyAI work offline?",
    a: "Core features require an internet connection for AI processing. However, downloaded flashcards and saved notes are accessible offline.",
  },
  {
    q: "How is my data protected?",
    a: "We use enterprise-grade encryption, never sell your data, and comply with FERPA guidelines for educational privacy.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left font-medium hover:bg-card/50 transition-colors"
              >
                {faq.q}
                <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", open === i && "rotate-180")} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-muted text-sm">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
