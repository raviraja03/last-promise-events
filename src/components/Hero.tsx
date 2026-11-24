
"use client";

import { motion } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[760px] items-center overflow-hidden bg-charcoal text-white"
      style={{ minHeight: "100svh" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/hero.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      <div className="section-container relative z-10 pt-24">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="eyebrow mb-8 text-champagne"
        >
          Curated Experiences · Timeless Memories
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="max-w-5xl text-[clamp(4rem,9vw,9rem)] leading-[0.85]"
        >
          Beyond Ordinary
          <br />
          <span className="italic text-champagne">
            Celebrations.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-10 max-w-lg text-sm leading-8 text-white/80 md:text-base"
        >
          From intimate moments to grand celebrations,
          we create thoughtfully designed experiences
          that stay with you forever.
        </motion.p>

        <motion.a
          href="#services"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="luxury-button mt-10"
        >
          Explore Our World <ArrowUpRight size={16} />
        </motion.a>
      </div>

      <a
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce"
      >
        <ArrowDown size={22} />
      </a>
    </section>
  );
}
