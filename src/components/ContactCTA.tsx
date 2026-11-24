
import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";

export default function ContactCTA() {
  return (
    <section id="contact" className="bg-ivory py-28 md:py-40">
      <div className="section-container text-center">
        <p className="eyebrow mb-8 text-taupe">
          Your Story Starts Here
        </p>

        <h2 className="mx-auto max-w-5xl text-6xl leading-[0.95] md:text-9xl">
          Let&apos;s Create
          <br />
          <span className="italic">Something Timeless.</span>
        </h2>

        <p className="mx-auto mt-9 max-w-xl text-sm leading-8 text-charcoal/65">
          Planning something special? Tell us what
          you&apos;re dreaming of. We&apos;d love to
          bring your vision to life.
        </p>

        <Link
          href="/contact"
          className="luxury-button mt-10"
        >
          Start a Conversation
          <ArrowUpRight size={17} />
        </Link>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-charcoal/60">
          <Mail size={14} />
          hello@lastpromiseevents.com
        </p>
      </div>
    </section>
  );
}
