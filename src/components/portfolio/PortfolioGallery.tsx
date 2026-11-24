
"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  portfolioCategories,
  portfolioItems,
  type PortfolioCategory,
} from "@/data/portfolio";

import PortfolioCard from "./PortfolioCard";
import PortfolioLightbox from "./PortfolioLightbox";

export default function PortfolioGallery() {
  const [category, setCategory] =
    useState<PortfolioCategory>("All");

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const filteredItems = useMemo(
    () =>
      category === "All"
        ? portfolioItems
        : portfolioItems.filter(
            (item) => item.category === category
          ),
    [category]
  );

  const closeLightbox = useCallback(
    () => setActiveIndex(null),
    []
  );

  const changeImage = useCallback(
    (index: number) => setActiveIndex(index),
    []
  );

  function selectCategory(next: PortfolioCategory) {
    setActiveIndex(null);
    setCategory(next);
  }

  return (
    <section
      id="portfolio"
      className="scroll-mt-24 bg-ivory py-24 md:py-36"
    >
      <div className="section-container">
        <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow mb-6 text-taupe">
              A World of Possibilities
            </p>

            <h2 className="font-heading text-6xl leading-[0.9] md:text-8xl">
              The Art of
              <br />
              <span className="italic text-gold">
                Celebration.
              </span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-8 text-charcoal/65">
            Explore the visual world of Last Promise.
            From timeless traditions to modern
            experiences, every celebration begins
            with an extraordinary idea.
          </p>
        </div>

        <p className="mb-9 border-l-2 border-champagne pl-4 text-xs leading-6 text-charcoal/65">
          Concept gallery — imagery is for creative
          inspiration and does not represent completed
          Last Promise Events projects.
        </p>

        <div
          role="group"
          aria-label="Filter portfolio by category"
          className="mb-12 flex flex-wrap gap-2 border-b border-charcoal/10 pb-6"
        >
          {portfolioCategories.map((option) => {
            const selected = category === option;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => selectCategory(option)}
                className={`rounded-full border px-5 py-3 text-xs font-semibold tracking-wide transition-colors duration-300 ${
                  selected
                    ? "border-charcoal bg-charcoal text-white"
                    : "border-charcoal/15 text-charcoal/65 hover:border-gold hover:text-charcoal"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredItems.map((item, index) => (
              <PortfolioCard
                key={item.id}
                item={item}
                onOpen={() => setActiveIndex(index)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <p className="py-20 text-center text-charcoal/60">
            No concepts available in this category yet.
          </p>
        )}

        <div className="mt-20 border-t border-charcoal/15 pt-10 text-center">
          <p className="font-heading text-3xl md:text-4xl">
            Have an extraordinary idea in mind?
          </p>
          <a
            href="#contact"
            className="luxury-button mt-6"
          >
            Create With Us
          </a>
        </div>
      </div>

      <PortfolioLightbox
        items={filteredItems}
        activeIndex={activeIndex}
        onClose={closeLightbox}
        onChange={changeImage}
      />
    </section>
  );
}
