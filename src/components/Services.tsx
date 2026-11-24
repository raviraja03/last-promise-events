
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { services } from "@/data/services";

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-36">
      <div className="section-container">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-5 text-taupe">What We Create</p>
            <h2 className="text-6xl leading-none md:text-8xl">
              Every Occasion,
              <br />
              <span className="italic">Extraordinary.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-charcoal/65">
            Each celebration deserves its own story.
            We bring yours to life with creativity,
            attention and timeless elegance.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
          {services.map((service, index) => (
            <article key={service.slug} className="group">
                <Link href={`/services/${service.slug}`} aria-label={`Explore ${service.title}`} className="relative block aspect-[4/3] overflow-hidden bg-[#e6ded3]">
                <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${service.image}')` }} />
                <span className="absolute left-6 top-6 text-sm text-white">{String(index + 1).padStart(2, "0")}</span>
              </Link>

              <div className="flex items-start justify-between gap-4 pt-6">
                <div>
                  <h3 className="text-3xl md:text-4xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-charcoal/65">
                    {service.description}
                  </p>
                </div>
                <Link
                  href={`/services/${service.slug}`}
                  aria-label={`Explore ${service.title}`}
                  className="rounded-full border border-charcoal/30 p-3 transition hover:bg-champagne"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>

<div className="mt-14 text-center">
  <Link
    href="/services"
    className="inline-flex items-center justify-center border border-[#D6AD60] bg-[#080808] px-8 py-4 font-heading text-xs font-medium uppercase tracking-[0.14em] text-[#F8F5EF] transition-colors hover:bg-[#D6AD60] hover:text-[#080808]"
  >
    Explore All Services
  </Link>
</div>

            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
