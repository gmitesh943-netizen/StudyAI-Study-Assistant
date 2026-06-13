import Link from "next/link";
import { Brain, Share2, Globe, Mail } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "#", label: "Careers" },
  ],
  Legal: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Brain className="h-7 w-7 text-primary" />
              <span>Study<span className="text-primary">AI</span></span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted">
              Your AI-powered study companion. Master any subject with personalized tutoring,
              smart flashcards, and adaptive learning plans.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-muted hover:text-primary transition-colors" aria-label="Share">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors" aria-label="Website">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted">
          © {new Date().getFullYear()} StudyAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
