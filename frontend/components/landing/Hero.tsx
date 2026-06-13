"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Brain } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered IT & Computer Science Learning
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Master the IT Field with{" "}
            <span className="gradient-text">StudyAI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl">
            Personalized AI tutoring, coding quizzes, software engineering study plans, and IT courses —
            everything you need to succeed in Information Technology.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg">Explore Features</Button>
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { icon: Brain, label: "50K+ IT Learners", desc: "Active tech students" },
              { icon: BookOpen, label: "100% IT Subjects", desc: "Software, Cloud & AI" },
              { icon: Sparkles, label: "4.9★ Rating", desc: "Developer approved" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass rounded-2xl p-4"
              >
                <stat.icon className="mx-auto h-6 w-6 text-primary mb-2" />
                <p className="font-bold">{stat.label}</p>
                <p className="text-sm text-muted">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
