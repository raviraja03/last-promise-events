"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { enquiryStatuses, serviceCategories } from "@/features/enquiries/schema";

type Item = {
  id: string;
  enquiry_reference: string;
  customer_name: string;
  customer_email: string;
  service_category: string;
  event_type: string;
  event_city: string;
  status: string;
  priority: string;
  created_at: string;
};

const categoryLabels: Record<string, string> = {
  weddings: "Weddings",
  "corporate-events": "Corporate",
  "private-events": "Private & social",
  "destination-events": "Destination",
  "digital-experiences": "Digital",
};

export default function AdminEnquiryList() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("created_at");
  const [direction, setDirection] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    const params = new URLSearchParams({ page: String(page), sort, direction });
    if (appliedSearch) params.set("search", appliedSearch);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    try {
      const response = await fetch(`/api/admin/enquiries?${params}`, { cache: "no-store", signal });
      const result = await response.json() as { items?: Item[]; count?: number; pages?: number; error?: string };
      if (!response.ok) {
        if (response.status === 401) { router.replace("/admin/login"); return; }
        setError(result.error ?? "Enquiries could not be loaded.");
        return;
      }
      setItems(result.items ?? []);
      setCount(result.count ?? 0);
      setPages(result.pages ?? 0);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError("We could not connect to the enquiry service.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, sort, direction, appliedSearch, status, category, router]);

  useEffect(() => {
    const controller = new AbortController();
    // State updates in load occur only after its network request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPage(1);
    setAppliedSearch(search.trim());
  }

  function updateFilter(action: () => void) {
    setLoading(true);
    setError("");
    action();
    setPage(1);
  }

  return <section>
    <div className="grid gap-3 border-b border-[#252322]/10 pb-5 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
      <form id="enquiry-search-form" onSubmit={submitSearch} className="relative"><label htmlFor="enquiry-search" className="sr-only">Search enquiries</label><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#252322]/45" /><input id="enquiry-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, city or reference" className="w-full border border-[#252322]/15 bg-white py-3 pl-9 pr-14 text-sm outline-none focus:border-[#9B773F] focus:ring-2 focus:ring-[#D6AD60]/30" /><button aria-label="Search enquiries" type="submit" className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-[#72552A] hover:bg-[#D6AD60]/15"><Search size={16} /></button></form>
      <label className="sr-only" htmlFor="status-filter">Filter by status</label><select id="status-filter" value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value))} className="border border-[#252322]/15 bg-white px-3 py-3 text-xs"><option value="">All statuses</option>{enquiryStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select>
      <label className="sr-only" htmlFor="category-filter">Filter by category</label><select id="category-filter" value={category} onChange={(event) => updateFilter(() => setCategory(event.target.value))} className="border border-[#252322]/15 bg-white px-3 py-3 text-xs"><option value="">All experiences</option>{serviceCategories.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}</select>
      <label className="sr-only" htmlFor="sort-filter">Sort enquiries</label><select id="sort-filter" value={`${sort}:${direction}`} onChange={(event) => { const [column, order] = event.target.value.split(":"); updateFilter(() => { setSort(column); setDirection(order); }); }} className="border border-[#252322]/15 bg-white px-3 py-3 text-xs"><option value="created_at:desc">Newest first</option><option value="created_at:asc">Oldest first</option><option value="updated_at:desc">Recently updated</option><option value="status:asc">Status A–Z</option><option value="priority:desc">Priority</option></select>
    </div>
    <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[#252322]/55"><p>{count} {count === 1 ? "enquiry" : "enquiries"}</p>{loading && <p role="status">Loading enquiries…</p>}</div>
    {error && <div role="alert" className="mt-5 border-l-2 border-red-800 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}
    {!loading && !error && items.length === 0 && <div className="mt-6 border border-dashed border-[#252322]/20 bg-white px-5 py-16 text-center"><p className="font-heading text-xl text-[#252322]">No enquiries match this view.</p><p className="mt-2 text-sm text-[#252322]/55">Try another search or filter. New submissions will appear here.</p></div>}
    {!error && items.length > 0 && <>
      <div className="mt-5 space-y-3 md:hidden">{items.map((item) => <EnquiryCard key={item.id} item={item} />)}</div>
      <div className="mt-5 hidden overflow-x-auto bg-white md:block"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-b border-[#252322]/10 text-[10px] uppercase tracking-wider text-[#252322]/50">{["Enquiry", "Experience", "Location", "Status", "Priority", "Received"].map((label) => <th key={label} scope="col" className="px-4 py-4 font-medium">{label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-[#252322]/8 last:border-0 hover:bg-[#F8F5EF]/60"><td className="px-4 py-4"><Link href={`/admin/enquiries/${item.id}`} className="font-medium text-[#252322] underline-offset-4 hover:underline">{item.customer_name}</Link><span className="mt-1 block text-[10px] text-[#252322]/45">{item.enquiry_reference} · {item.event_type}</span></td><td className="px-4 py-4 text-xs text-[#252322]/70">{categoryLabels[item.service_category] ?? item.service_category}</td><td className="px-4 py-4 text-xs text-[#252322]/70">{item.event_city}</td><td className="px-4 py-4 text-xs">{item.status.replaceAll("_", " ")}</td><td className="px-4 py-4 text-xs">{item.priority}</td><td className="px-4 py-4 text-xs text-[#252322]/60">{formatDate(item.created_at)}</td></tr>)}</tbody></table></div>
      <nav aria-label="Enquiry pages" className="mt-6 flex items-center justify-between border-t border-[#252322]/10 pt-5"><button type="button" disabled={page <= 1 || loading} onClick={() => { setLoading(true); setError(""); setPage((value) => Math.max(1, value - 1)); }} className="inline-flex items-center gap-2 px-2 py-2 text-xs uppercase tracking-wider disabled:opacity-35"><ArrowLeft size={15} />Previous</button><span className="text-xs text-[#252322]/55">Page {page} of {Math.max(1, pages)}</span><button type="button" disabled={page >= pages || loading} onClick={() => { setLoading(true); setError(""); setPage((value) => Math.min(pages, value + 1)); }} className="inline-flex items-center gap-2 px-2 py-2 text-xs uppercase tracking-wider disabled:opacity-35">Next<ArrowRight size={15} /></button></nav>
    </>}
  </section>;
}

function EnquiryCard({ item }: { item: Item }) {
  return <Link href={`/admin/enquiries/${item.id}`} className="block border border-[#252322]/10 bg-white p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9B773F]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-[#252322]">{item.customer_name}</p><p className="mt-1 truncate text-xs text-[#252322]/55">{item.event_type} · {item.event_city}</p></div><span className="shrink-0 text-[10px] uppercase tracking-wide text-[#72552A]">{item.status.replaceAll("_", " ")}</span></div><div className="mt-4 flex items-center justify-between gap-3 border-t border-[#252322]/8 pt-3 text-[10px] text-[#252322]/50"><span>{categoryLabels[item.service_category] ?? item.service_category} · {item.priority}</span><span>{formatDate(item.created_at)}</span></div><span className="mt-2 block font-mono text-[10px] text-[#252322]/40">{item.enquiry_reference}</span></Link>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
