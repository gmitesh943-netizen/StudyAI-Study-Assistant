"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Message sent! We'll get back to you soon.", "success");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-center mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-center text-muted mb-12">We&apos;d love to hear from you.</p>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card glass>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </Card>
            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "mgauswami187@rku.ac.in" },
                { icon: Phone, label: "Phone", value: "8780102206" },
                { icon: MapPin, label: "Office", value: "Rajkot" },
              ].map((item) => (
                <Card key={item.label} className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
