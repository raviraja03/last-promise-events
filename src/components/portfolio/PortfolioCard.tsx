
"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioItem } from "@/data/portfolio";

type Props = {
  item: PortfolioItem;
  onOpen: () => void;
};

export default function PortfolioCard({
  item,
  onOpen,
}: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
      className={`group min-w-0 ${
        item.featured ? "md:col-span-2" : ""
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${item.title}`}
        className="block w-full cursor-pointer text-left"
      >
        <div
          className={`relative overflow-hidden bg-[#d8c9b5] ${
            item.featured
              ? "aspect-[4/3] md:aspect-[16/9]"
              : "aspect-[4/3]"
          }`}
        >
          <Image
            src={item.image}
            alt={item.alt}
            fill
            sizes={
              item.featured
                ? "(max-width: 768px) 100vw, 66vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <span className="absolute left-5 top-5 border border-white/40 bg-black/25 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {item.category}
          </span>

          <div className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/10 text-white backdrop-blur-md transition group-hover:bg-champagne group-hover:text-charcoal">
            <ArrowUpRight size={21} />
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 pt-5">
          <div>
            <p className="eyebrow mb-2 text-taupe">
              {item.category} / Concept
            </p>
            <h3 className="font-heading text-3xl leading-tight md:text-4xl">
              {item.title}
            </h3>
          </div>
        </div>
      </button>
    </motion.article>
  );
}
