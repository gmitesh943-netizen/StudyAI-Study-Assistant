import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-8">
        <div className="text-center px-4 mb-8">
          <h1 className="text-4xl font-bold">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
        </div>
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
