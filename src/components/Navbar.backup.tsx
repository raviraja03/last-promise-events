
"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X, ArrowUpRight } from "lucide-react";

const links = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 text-white">
      <nav className="section-container flex h-24 items-center justify-between">
        
<a
  href="#home"
  aria-label="Last Promise Events Home"
  className="flex shrink-0 items-center"
>
  <Image
    src="/images/last-promise-logo.png"
    alt="Last Promise Events"
    width={2048}
    height={672}
    priority
    unoptimized
    className="block h-auto w-44 object-contain sm:w-52 lg:w-60"
  />
</a>


        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs tracking-widest uppercase transition hover:text-champagne"
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" className="luxury-button">
            Plan Your Event <ArrowUpRight size={15} />
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="lg:hidden"
        >
          {open ? <X size={27} /> : <Menu size={27} />}
        </button>
      </nav>

      {open && (
        <div className="absolute inset-x-0 top-24 bg-charcoal px-8 py-8 lg:hidden">
          <div className="flex flex-col gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-widest"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
