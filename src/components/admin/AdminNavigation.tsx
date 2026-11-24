"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";

export default function AdminNavigation({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    setBusy(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) { setLogoutError("Sign out could not be completed. Please try again."); return; }
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLogoutError("Sign out could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const links = [{ href: "/admin", label: "Overview" }, { href: "/admin/enquiries", label: "Enquiries" }];
  return <header className="border-b border-white/10 bg-[#080808] text-[#F8F5EF]">
    <nav aria-label="Admin navigation" className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
      <Link href="/admin" className="font-heading text-sm tracking-[0.15em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D6AD60]">LAST PROMISE <span className="text-[#D6AD60]">/ ADMIN</span></Link>
      <div className="hidden items-center gap-7 md:flex">{links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`text-xs uppercase tracking-wider transition hover:text-[#D6AD60] ${pathname === link.href ? "text-[#D6AD60]" : "text-white/70"}`}>{link.label}</Link>)}</div>
      <div className="hidden items-center gap-4 md:flex"><span className="max-w-48 truncate text-xs text-white/55">{email}</span>{logoutError && <span role="alert" className="text-xs text-rose-200">{logoutError}</span>}<button type="button" disabled={busy} onClick={() => void logout()} className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/75 hover:text-[#D6AD60] disabled:opacity-50">{busy ? "Signing out…" : "Sign out"}<LogOut size={14} /></button><Link href="/" aria-label="Return to public website" className="text-white/45 hover:text-white"><ArrowUpRight size={15} /></Link></div>
      <button type="button" className="md:hidden" aria-label={open ? "Close admin navigation" : "Open admin navigation"} aria-expanded={open} aria-controls="admin-mobile-nav" onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </nav>
    {open && <div id="admin-mobile-nav" className="border-t border-white/10 px-5 py-5 md:hidden"><div className="flex flex-col gap-4">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-xs uppercase tracking-wider">{link.label}</Link>)}<span className="truncate text-xs text-white/50">{email}</span>{logoutError && <p role="alert" className="text-xs text-rose-200">{logoutError}</p>}<button type="button" onClick={() => void logout()} disabled={busy} className="inline-flex items-center gap-2 self-start text-xs uppercase tracking-wider">{busy ? "Signing out…" : "Sign out"} <LogOut size={14} /></button></div></div>}
  </header>;
}
