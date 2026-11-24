
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";

type Props = {
  service: Service;
};

export default function ServiceHero({ service }: Props) {
  return (
    <section
      aria-labelledby="service-title"
      className="relative isolate flex min-h-[620px] items-end overflow-hidden bg-[#080808] text-[#F8F5EF] md:min-h-[720px]"
    >
      <Image
        src={service.image}
        alt={service.imageAlt}
        fill
        priority
        sizes="100vw"
        className="absolute -z-20 object-cover object-center"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080808]/95 via-[#080808]/50 to-[#080808]/30" />

      <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-36 sm:px-10 lg:px-16 lg:pb-28">
        <Link
          href="/services"
          className="mb-10 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-[#F8F5EF]/75 transition hover:text-[#D6AD60]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          All Services
        </Link>

        <p className="mb-5 font-heading text-xs font-medium uppercase tracking-[0.22em] text-[#D6AD60]">
          {service.eyebrow}
        </p>

        <h1
          id="service-title"
          className="max-w-4xl font-heading text-5xl font-light leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl"
        >
          {service.title}
        </h1>

        <p className="mt-7 max-w-xl font-body text-base leading-8 text-[#F8F5EF]/80 md:text-lg">
          {service.tagline}
        </p>

        <Link
          href={`/contact?service=${encodeURIComponent(service.slug)}`}
          className="mt-9 inline-flex items-center gap-3 border border-[#D6AD60] px-6 py-4 font-heading text-xs font-medium uppercase tracking-[0.12em] text-[#F8F5EF] transition hover:bg-[#D6AD60] hover:text-[#080808]"
        >
          Enquire About This Service
          <ArrowUpRight size={17} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
