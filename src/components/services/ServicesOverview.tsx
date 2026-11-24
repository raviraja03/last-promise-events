
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";

export default function ServicesOverview() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="bg-[#F8F5EF] py-16 text-[#252322] md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 max-w-3xl">
          <p className="mb-5 font-heading text-xs font-medium uppercase tracking-[0.2em] text-[#9B773F]">
            Our Expertise
          </p>

          <h2 className="font-heading text-4xl font-light leading-[1.12] tracking-tight md:text-6xl">
            Every Occasion.
            <span className="mt-2 block text-[#9B773F]">
              Beautifully Considered.
            </span>
          </h2>

          <p className="mt-7 max-w-xl font-body text-sm leading-8 text-[#252322]/65">
            Discover a world of event experiences, thoughtfully
            imagined for meaningful moments and lasting memories.
          </p>
        </div>

        <div className="space-y-20 md:space-y-28">
          {services.map((service, index) => (
            <motion.article
              key={service.slug}
              initial={
                reducedMotion ? false : { opacity: 0, y: 35 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: reducedMotion ? 0 : 0.6 }}
              className="grid items-center gap-9 lg:grid-cols-2 lg:gap-20"
            >
              <Link
                href={`/services/${service.slug}`}
                aria-label={`Explore ${service.title}`}
                className={`group relative block aspect-[4/3] overflow-hidden bg-[#252322] ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </Link>

              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <p className="mb-5 font-heading text-xs font-medium uppercase tracking-[0.2em] text-[#9B773F]">
                  {String(index + 1).padStart(2, "0")} / {service.eyebrow}
                </p>

                <h3 className="max-w-lg font-heading text-3xl font-light leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
                  {service.title}
                </h3>

                <p className="mt-6 max-w-lg font-body text-sm leading-8 text-[#252322]/70 md:text-base">
                  {service.description}
                </p>

                <Link
                  href={`/services/${service.slug}`}
                  className="mt-8 inline-flex items-center gap-4 border-b border-[#9B773F] pb-3 font-heading text-xs font-medium uppercase tracking-[0.12em] text-[#252322] transition hover:text-[#9B773F]"
                >
                  Discover the Experience
                  <ArrowUpRight size={18} strokeWidth={1.5} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
