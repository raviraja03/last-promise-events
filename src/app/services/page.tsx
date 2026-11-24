import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesOverview from "@/components/services/ServicesOverview";

export const metadata: Metadata = {
  title: "Our Services | Last Promise Events",
  description: "Explore weddings, corporate events, private celebrations, destination experiences and digital event services.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return <>
    <Navbar />
    <main id="main-content">
      <section className="bg-[#080808] px-6 pb-16 pt-36 text-center text-[#F8F5EF] sm:px-10 md:pb-20 md:pt-44">
        <p className="mb-5 font-heading text-xs font-medium uppercase tracking-[0.2em] text-[#D6AD60]">Our Expertise</p>
        <h1 className="font-heading text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">Our Experiences</h1>
        <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-8 text-[#F8F5EF]/70 md:text-base">Thoughtfully created celebrations, purposeful experiences and meaningful connections.</p>
      </section>
      <ServicesOverview />
    </main>
    <Footer />
  </>;
}
