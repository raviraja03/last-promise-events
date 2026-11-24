
"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";

type Props = {
  service: Service;
};

export default function ServiceDetails({ service }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="bg-[#F8F5EF] py-20 text-[#252322] md:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid gap-12 border-b border-[#252322]/15 pb-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="mb-5 font-heading text-xs font-medium uppercase tracking-[0.2em] text-[#9B773F]">
              The Experience
            </p>

            <h2 className="max-w-lg font-heading text-4xl font-light leading-[1.12] tracking-tight md:text-5xl">
              Designed with intention.
              <span className="mt-2 block text-[#9B773F]">
                Remembered with feeling.
              </span>
            </h2>
          </div>

          <div className="flex flex-col justify-center">
            <p className="max-w-2xl font-body text-base leading-9 text-[#252322]/75 md:text-lg">
              {service.introduction}
            </p>
          </div>
        </div>

        <div className="py-16 md:py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-4 font-heading text-xs font-medium uppercase tracking-[0.2em] text-[#9B773F]">
                What We Offer
              </p>
              <h2 className="font-heading text-4xl font-light tracking-tight md:text-5xl">
                Curated for Your Occasion
              </h2>
            </div>
            <span className="font-heading text-xs text-[#252322]/50">
              {String(service.offerings.length).padStart(2, "0")} Experiences
            </span>
          </div>

          <div className="grid gap-x-12 gap-y-12 md:grid-cols-2">
            {service.offerings.map((offering, index) => (
              <motion.article
                key={offering.title}
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, y: 24 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.55,
                  delay: reducedMotion ? 0 : (index % 2) * 0.08,
                }}
                className="group border-t border-[#252322]/20 pt-7"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-heading text-xs text-[#9B773F]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.25}
                    className="text-[#9B773F] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>

                <h3 className="mb-4 font-heading text-2xl font-normal tracking-tight md:text-3xl">
                  {offering.title}
                </h3>

                <p className="max-w-md font-body text-sm leading-8 text-[#252322]/65">
                  {offering.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="border-t border-[#252322]/15 pt-10">
          <p className="mb-6 font-heading text-xs font-medium uppercase tracking-[0.2em] text-[#9B773F]">
            Experiences We Can Help Create
          </p>

          <div className="flex flex-wrap gap-3">
            {service.highlights.map((highlight) => (
              <span
                key={highlight}
                className="border border-[#252322]/15 px-5 py-3 font-body text-xs text-[#252322]/75"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
