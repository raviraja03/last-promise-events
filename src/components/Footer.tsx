
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal py-14 text-white">
      <div className="section-container">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="font-heading text-4xl tracking-wider">
              LAST PROMISE
            </p>
            <p className="mt-2 text-xs tracking-[0.45em]">
              EVENTS
            </p>
            <p className="mt-6 max-w-xs text-sm leading-7 text-white/50">
              Thoughtfully created experiences.
              Beautifully remembered moments.
            </p>
          </div>

          <div className="flex gap-16 text-sm">
            <div className="flex flex-col gap-4">
              <span className="text-champagne">Explore</span>
              <Link href="/">Home</Link>
              <Link href="/#about">About</Link>
              <Link href="/services">Services</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-champagne">Connect</span>
              <Link href="/contact">Contact</Link>
              <a href="mailto:hello@lastpromiseevents.com">
                Email Us
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/15 pt-7 text-xs text-white/45 md:flex-row">
          <p>
            © 2026 Last Promise Events.
            All rights reserved.
          </p>
          <p>Beyond Ordinary Celebrations.</p>
        </div>
      </div>
    </footer>
  );
}
