"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Medical Student, AIIMS",
    text: "StudyAI helped me cut my revision time in half. The AI tutor explains concepts better than most textbooks.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "CS Major, MIT",
    text: "The flashcard generator and quiz features are incredible. I went from a C to an A in Data Structures.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Engineering Student, Stanford",
    text: "PDF summarizer saved me during finals week. Upload a 50-page chapter and get perfect notes in minutes.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 bg-card/50">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Loved by <span className="gradient-text">Students</span> Worldwide
          </h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card glass className="h-full">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-muted mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-bold">{t.name}</p>
                <p className="text-sm text-muted">{t.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
