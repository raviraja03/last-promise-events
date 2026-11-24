
import type { MetadataRoute } from "next";
import { services } from "@/data/services";

const baseUrl = "https://lastpromiseevents.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    ...services.map((service) => ({
      url: `${baseUrl}/services/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
