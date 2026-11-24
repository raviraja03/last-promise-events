
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceDetails from "@/components/services/ServiceDetails";
import ServiceCTA from "@/components/services/ServiceCTA";

import {
  services,
  getServiceBySlug,
} from "@/data/services";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Last Promise Events",
    };
  }

  return {
    title: `${service.title} | Last Promise Events`,
    description: service.seoDescription,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.title} | Last Promise Events`,
      description: service.seoDescription,
      type: "website",
      images: [
        {
          url: service.image,
          alt: service.imageAlt,
        },
      ],
    },
  };
}

export default async function ServicePage({
  params,
}: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main id="main-content">
        <ServiceHero service={service} />
        <ServiceDetails service={service} />
        <ServiceCTA service={service} />
      </main>

      <Footer />
    </>
  );
}
