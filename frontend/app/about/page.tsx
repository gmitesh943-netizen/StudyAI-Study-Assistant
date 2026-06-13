import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import { Target, Users, Zap } from "lucide-react";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-4">
            About <span className="gradient-text">StudyAI</span>
          </h1>
          <p className="text-center text-muted max-w-2xl mx-auto mb-16">
            We&apos;re on a mission to make quality education accessible to every student through
            the power of artificial intelligence.
          </p>
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {[
              { icon: Target, title: "Our Mission", desc: "Democratize personalized learning for students worldwide, regardless of background or resources." },
              { icon: Users, title: "Our Team", desc: "Built by educators, engineers, and students who understand the challenges of modern academia." },
              { icon: Zap, title: "Our Vision", desc: "A world where every student has an AI tutor that adapts to their unique learning style." },
            ].map((item) => (
              <Card key={item.title} hover>
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
          <Card glass>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted leading-relaxed">
              StudyAI was founded in 2024 when a group of university students realized that traditional
              study tools weren&apos;t keeping up with how students actually learn. We combined cutting-edge
              AI with proven learning science to create a platform that doesn&apos;t just answer questions —
              it teaches you how to think. Today, over 50,000 students across 40 countries use StudyAI
              to prepare for exams, master new subjects, and build lasting knowledge.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
