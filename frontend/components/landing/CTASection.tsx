"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary to-red-700 p-12 text-center text-white shadow-2xl shadow-primary/25"
      >
        <h2 className="text-3xl font-bold sm:text-4xl">Ready to Transform Your Studies?</h2>
        <p className="mt-4 text-white/80 max-w-xl mx-auto">
          Join 50,000+ students already learning smarter with StudyAI. Start your free trial today.
        </p>
        <Link href="/sign-up" className="inline-block mt-8">
          <Button size="lg" variant="secondary" className="gap-2 bg-white text-primary hover:bg-gray-100">
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
