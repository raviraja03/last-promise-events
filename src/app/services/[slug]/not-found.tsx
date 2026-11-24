
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ServiceNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 py-20 text-center text-[#F8F5EF]">
      <div className="max-w-xl">
        <p className="mb-5 font-heading text-xs uppercase tracking-[0.2em] text-[#D6AD60]">
          Page Not Found
        </p>

        <h1 className="font-heading text-4xl font-light md:text-6xl">
          This Experience Could Not Be Found.
        </h1>

        <p className="mt-6 font-body text-sm leading-8 text-[#F8F5EF]/65">
          The service you&apos;re looking for may have moved
          or is no longer available.
        </p>

        <Link
          href="/services"
          className="mt-10 inline-flex items-center gap-3 border border-[#D6AD60] px-7 py-4 text-xs uppercase tracking-widest transition hover:bg-[#D6AD60] hover:text-[#080808]"
        >
          <ArrowLeft size={17} />
          Explore Our Services
        </Link>
      </div>
    </main>
  );
}
