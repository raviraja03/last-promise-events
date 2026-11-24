import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { getAdminSession } from "@/lib/admin-auth";
import { enquiryStatuses, serviceCategories } from "@/features/enquiries/schema";
import { getPrisma } from "@/lib/prisma";

const categoryLabels: Record<(typeof serviceCategories)[number], string> = {
  weddings: "Weddings",
  "corporate-events": "Corporate",
  "private-events": "Private & social",
  "destination-events": "Destination",
  "digital-experiences": "Digital",
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const prisma = getPrisma();
  if (!prisma) return <><AdminNavigation email={session.email} /><main className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><h1 className="font-heading text-3xl font-light text-[#252322]">Dashboard unavailable</h1><p role="alert" className="mt-4 border-l-2 border-red-800 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">We could not load the enquiry overview. Check the database setup and try again.</p></main></>;
  let statusCounts: Array<[string, number]>;
  let categoryCounts: Array<[string, number]>;
  let recent;
  try {
    [statusCounts, categoryCounts, recent] = await Promise.all([
      Promise.all(enquiryStatuses.map(async (status) => [status, await prisma.eventEnquiry.count({ where: { status } })] as [string, number])),
      Promise.all(serviceCategories.map(async (category) => [category, await prisma.eventEnquiry.count({ where: { serviceCategory: category } })] as [string, number])),
      prisma.eventEnquiry.findMany({ select: { id: true, enquiryReference: true, customerName: true, serviceCategory: true, eventType: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    ]);
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_dashboard_query_failed", code: error instanceof Error ? error.name : "unknown" }));
    return <><AdminNavigation email={session.email} /><main className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><h1 className="font-heading text-3xl font-light text-[#252322]">Dashboard unavailable</h1><p role="alert" className="mt-4 border-l-2 border-red-800 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">We could not load the enquiry overview. Check the database setup and try again.</p></main></>;
  }
  const statuses = Object.fromEntries(statusCounts);
  const categories = Object.fromEntries(categoryCounts);
  const total = Object.values(statuses).reduce((sum, count) => sum + count, 0);

  return <>
    <AdminNavigation email={session.email} />
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9B773F]">Lead overview</p><h1 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#252322] sm:text-4xl">Enquiries</h1></div>
        <Link href="/admin/enquiries" className="inline-flex items-center gap-2 border border-[#252322]/20 px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#252322] hover:border-[#9B773F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9B773F]">Manage enquiries <ArrowUpRight size={15} /></Link>
      </div>

      <section aria-label="Enquiry totals" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="All enquiries" value={total} />
        <Metric label="New enquiries" value={statuses.NEW ?? 0} />
        <Metric label="Qualified leads" value={statuses.QUALIFIED ?? 0} />
        <Metric label="Confirmed" value={statuses.CONFIRMED ?? 0} />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-white p-5 sm:p-7" aria-labelledby="category-summary">
          <h2 id="category-summary" className="font-heading text-xl font-normal text-[#252322]">By experience</h2>
          <div className="mt-5 space-y-4">{serviceCategories.map((category) => <div key={category} className="flex items-center justify-between gap-4 border-b border-[#252322]/8 pb-3"><span className="text-sm text-[#252322]/75">{categoryLabels[category]}</span><span className="font-heading text-lg text-[#252322]">{categories[category] ?? 0}</span></div>)}</div>
        </section>
        <section className="bg-white p-5 sm:p-7" aria-labelledby="status-summary">
          <h2 id="status-summary" className="font-heading text-xl font-normal text-[#252322]">Status distribution</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{enquiryStatuses.map((status) => <div key={status} className="border border-[#252322]/10 p-3"><p className="text-[10px] uppercase tracking-wider text-[#252322]/50">{status.replaceAll("_", " ")}</p><p className="mt-2 font-heading text-xl text-[#252322]">{statuses[status] ?? 0}</p></div>)}</div>
        </section>
      </div>

      <section className="mt-8 bg-white p-5 sm:p-7" aria-labelledby="recent-enquiries">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 id="recent-enquiries" className="font-heading text-xl font-normal text-[#252322]">Recent enquiries</h2><Link href="/admin/enquiries" className="text-xs font-medium uppercase tracking-wider text-[#72552A] underline underline-offset-4">View all</Link></div>
        {!recent.length ? <div className="py-12 text-center"><p className="text-sm text-[#252322]/70">No enquiries have arrived yet.</p><p className="mt-2 text-xs text-[#252322]/50">New enquiries will appear here after customers submit the contact form.</p></div> : <div className="divide-y divide-[#252322]/10">{recent.map((item) => <Link key={item.id} href={`/admin/enquiries/${item.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9B773F]"><span className="min-w-0"><span className="block truncate text-sm font-medium text-[#252322]">{item.customerName} <span className="font-normal text-[#252322]/50">· {item.eventType}</span></span><span className="mt-1 block text-xs text-[#252322]/50">{item.enquiryReference} · {categoryLabels[item.serviceCategory as keyof typeof categoryLabels]}</span></span><span className="text-xs uppercase tracking-wider text-[#72552A]">{item.status.replaceAll("_", " ")}</span></Link>)}</div>}
      </section>
    </main>
  </>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="bg-white p-5 sm:p-6"><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#252322]/55">{label}</p><p className="mt-3 font-heading text-3xl font-light text-[#252322]">{value}</p></div>;
}

