import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Services from "@/components/Services";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Last Promise Events | Beyond Ordinary Celebrations",
  description: "Thoughtfully created wedding, corporate, private, destination and digital event experiences.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <>
    <Navbar />
    <main id="main-content">
      <Hero />
      <Experience />
      <Services />
      <PortfolioGallery />
      <ContactCTA />
    </main>
    <Footer />
  </>;
}
