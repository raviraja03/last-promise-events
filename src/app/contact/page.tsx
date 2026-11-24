import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnquiryForm from "@/components/enquiries/EnquiryForm";
import { resolveServiceCategory } from "@/features/enquiries/schema";

export const metadata: Metadata = {
  title: "Start an Event Enquiry | Last Promise Events",
  description: "Tell us about the event you are imagining. Share a few details and begin a considered conversation with Last Promise Events.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string | string[] }> }) {
  const params = await searchParams;
  const service = typeof params.service === "string" ? resolveServiceCategory(params.service) : undefined;

  return <>
    <Navbar solid />
    <main id="main-content" className="min-h-[70vh] bg-[#F8F5EF]">
      <EnquiryForm initialCategory={service} />
    </main>
    <Footer />
  </>;
}
