
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";


const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/contact" },
];


export default function Navbar({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`${solid ? "relative bg-[#080808]" : "absolute"} inset-x-0 top-0 z-50 text-white`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-[#F8F5EF] focus:px-4 focus:py-3 focus:text-[#080808]">Skip to content</a>
      <nav className="section-container flex h-24 items-center justify-between">
        <Link href="/" aria-label="Last Promise Events home" className="flex shrink-0 items-center">
          <Image src="/images/last-promise-logo.png" alt="Last Promise Events" width={2048} height={672} priority unoptimized className="block h-auto w-36 object-contain sm:w-44 lg:w-52" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs tracking-widest uppercase transition hover:text-champagne"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className="luxury-button">
            Plan Your Event <ArrowUpRight size={15} />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
          className="lg:hidden"
        >
          {open ? <X size={27} /> : <Menu size={27} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-24 bg-charcoal px-8 py-8 lg:hidden">
          <div className="flex flex-col gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-widest"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="luxury-button w-fit">Plan Your Event <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      )}
    </header>
  );
}
