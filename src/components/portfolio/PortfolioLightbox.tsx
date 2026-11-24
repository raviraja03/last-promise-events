
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { PortfolioItem } from "@/data/portfolio";

type Props = {
  items: PortfolioItem[];
  activeIndex: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export default function PortfolioLightbox({
  items,
  activeIndex,
  onClose,
  onChange,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isOpen = activeIndex !== null;
  const item = activeIndex === null
    ? null
    : items[activeIndex];

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = oldOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onChange((activeIndex! + 1) % items.length);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onChange(
          (activeIndex! - 1 + items.length) % items.length
        );
      }

      if (event.key === "Tab") {
        const modal = document.getElementById(
          "portfolio-lightbox"
        );
        const controls = modal?.querySelectorAll<
          HTMLButtonElement
        >("button:not(:disabled)");

        if (!controls?.length) return;

        const first = controls[0];
        const last = controls[controls.length - 1];

        if (event.shiftKey &&
            document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, items.length, onClose, onChange]);

  return (
    <AnimatePresence>
      {item && activeIndex !== null && (
        <motion.div
          id="portfolio-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} gallery viewer`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col bg-[#080808]/98 text-white"
        >
          <div className="flex shrink-0 items-center justify-between px-5 py-5 md:px-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-champagne">
                Last Promise / Portfolio
              </p>
              <p className="mt-1 text-xs text-white/60">
                {activeIndex + 1} / {items.length}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close gallery"
              className="rounded-full border border-white/30 p-3 transition hover:bg-white/15"
            >
              <X size={22} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative h-full w-full"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() =>
                    onChange(
                      (activeIndex - 1 + items.length) %
                        items.length
                    )
                  }
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/60 p-3 backdrop-blur-md transition hover:bg-champagne hover:text-black md:left-8"
                >
                  <ArrowLeft size={20} />
                </button>

                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() =>
                    onChange((activeIndex + 1) % items.length)
                  }
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/60 p-3 backdrop-blur-md transition hover:bg-champagne hover:text-black md:right-8"
                >
                  <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>

          <div className="shrink-0 px-5 py-6 text-center md:px-10">
            <p className="eyebrow text-champagne">
              {item.category} · Concept Inspiration
            </p>
            <h2 className="mt-2 font-heading text-3xl md:text-5xl">
              {item.title}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-white/60 md:text-sm">
              {item.description}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
