"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import {
  MessageSquare,
  FileText,
  Layers,
  Calendar,
  Upload,
  Mic,
  Brain,
  BarChart3,
} from "lucide-react";

const features = [
  { icon: MessageSquare, title: "AI IT Tutor", desc: "24/7 personalized tutoring across programming, databases, cloud, and security." },
  { icon: Brain, title: "Smart Coding Quizzes", desc: "Adaptive quizzes testing syntax, logic, algorithms, and system design." },
  { icon: Layers, title: "IT Flashcards", desc: "AI-generated flashcards for terms, CLI commands, and design patterns." },
  { icon: FileText, title: "Tech Note Generator", desc: "Transform complex IT topics into clean structured notes and cheatsheets instantly." },
  { icon: Upload, title: "Documentation Summarizer", desc: "Upload PDFs, CS textbooks, or API documentations to get quick key points." },
  { icon: Calendar, title: "Dev Study Planner", desc: "AI-crafted daily study schedules tailored to your technical topics and roadmap." },
  { icon: Mic, title: "Voice Coding Assistant", desc: "Hands-free studying with voice commands and spoken explanations of code." },
  { icon: BarChart3, title: "Dev Progress Analytics", desc: "Track coding hours, quiz scores, and subject mastery over time." },
];

export default function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto">
            A complete suite of AI-powered study tools designed for modern IT students and developers.
          </p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover className="h-full">
                <f.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
