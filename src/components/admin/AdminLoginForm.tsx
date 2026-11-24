"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { setError(result.error ?? "Sign in could not be completed."); return; }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("We could not connect securely. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-2 w-full border border-[#252322]/20 bg-[#F8F5EF] px-4 py-3.5 text-sm outline-none focus:border-[#9B773F] focus:ring-2 focus:ring-[#D6AD60]/30";
  return <form className="mt-8 space-y-5" onSubmit={submit}>
    <div><label htmlFor="admin-email" className="block text-sm text-[#252322]">Email</label><input id="admin-email" type="email" autoComplete="username" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} className={input} /></div>
    <div><label htmlFor="admin-password" className="block text-sm text-[#252322]">Password</label><input id="admin-password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} className={input} /></div>
    {error && <p className="border-l-2 border-red-800 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p>}
    <button type="submit" disabled={busy} className="w-full bg-[#080808] px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[#F8F5EF] hover:bg-[#252322] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B773F] disabled:cursor-wait disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
    <p className="text-xs leading-6 text-[#252322]/50">Admin accounts are provisioned by an authorized Supabase project owner. Registration is not available here.</p>
  </form>;
}
