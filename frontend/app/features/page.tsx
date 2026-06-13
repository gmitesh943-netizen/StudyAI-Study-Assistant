import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Features from "@/components/landing/Features";
import CTASection from "@/components/landing/CTASection";

export const metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-8">
        <div className="text-center px-4 mb-8">
          <h1 className="text-4xl font-bold">
            Powerful <span className="gradient-text">Features</span>
          </h1>
          <p className="mt-4 text-muted">Everything you need to study smarter, not harder.</p>
        </div>
        <Features />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
