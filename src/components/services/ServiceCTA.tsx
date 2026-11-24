
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";

type Props = {
  service: Service;
};

export default function ServiceCTA({ service }: Props) {
  return (
    <section className="bg-[#080808] px-6 py-24 text-center text-[#F8F5EF] sm:px-10 md:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="mb-7 font-heading text-xs font-medium uppercase tracking-[0.22em] text-[#D6AD60]">
          Your Story, Our Promise
        </p>

        <h2 className="font-heading text-4xl font-light leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
          Let&apos;s Create Something
          <span className="mt-2 block text-[#D6AD60]">
            Extraordinary.
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-xl font-body text-sm leading-8 text-[#F8F5EF]/65 md:text-base">
          Tell us about the occasion you&apos;re imagining.
          We&apos;d love to explore the possibilities with you.
        </p>

        <Link
          href={`/contact?service=${encodeURIComponent(service.slug)}`}
          className="mt-10 inline-flex items-center gap-4 bg-[#D6AD60] px-8 py-4 font-heading text-xs font-medium uppercase tracking-[0.14em] text-[#080808] transition hover:bg-[#F8F5EF]"
        >
          Start a Conversation
          <ArrowUpRight size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
