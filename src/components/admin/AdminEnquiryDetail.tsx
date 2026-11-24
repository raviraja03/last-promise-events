"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, CalendarDays, Users, Building2 } from "lucide-react";
import { enquiryPriorities, enquiryStatuses } from "@/features/enquiries/schema";

type Enquiry = {
  id: string;
  enquiry_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  preferred_contact_method: string;
  company_name: string | null;
  service_category: string;
  event_type: string;
  event_date: string | null;
  date_flexible: boolean;
  event_city: string;
  event_location: string | null;
  expected_guests: number | null;
  estimated_budget: string | null;
  venue_status: string;
  event_description: string | null;
  status: typeof enquiryStatuses[number];
  priority: typeof enquiryPriorities[number];
  internal_notes: string | null;
  consent_to_contact: boolean;
  created_at: string;
  updated_at: string;
};

type Activity = { id: string; previous_status: string | null; new_status: string; changed_by: string; created_at: string };
type Payload = { enquiry: Enquiry; activity: Activity[] };

const categories: Record<string, string> = {
  weddings: "Weddings & Celebrations",
  "corporate-events": "Corporate & Brand Events",
  "private-events": "Private & Social Events",
  "destination-events": "Destination Experiences",
  "digital-experiences": "Digital Event Experiences",
};

export default function AdminEnquiryDetail({ id }: { id: string }) {
  const router = useRouter();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [status, setStatus] = useState<Enquiry["status"]>("NEW");
  const [priority, setPriority] = useState<Enquiry["priority"]>("MEDIUM");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(signal?: AbortSignal) {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, { cache: "no-store", signal });
      const result = await response.json() as Payload & { error?: string };
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok) { setError(result.error ?? "Enquiry could not be loaded."); return; }
      setPayload(result);
      setStatus(result.enquiry.status);
      setPriority(result.enquiry.priority);
      setNotes(result.enquiry.internal_notes ?? "");
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError("We could not connect to the enquiry service.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    // State updates in load occur only after its network request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
    // Load once for this enquiry identifier.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, priority, internalNotes: notes }) });
      const result = await response.json().catch(() => ({})) as { enquiry?: Enquiry; error?: string };
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok || !result.enquiry) { setError(result.error ?? "Changes could not be saved."); return; }
      setMessage("Changes saved.");
      await load();
    } catch {
      setError("We could not connect to save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p role="status" className="py-16 text-sm text-[#252322]/60">Loading enquiry…</p>;
  if (error && !payload) return <div role="alert" className="my-8 border-l-2 border-red-800 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>;
  if (!payload) return null;
  const enquiry = payload.enquiry;

  return <>
    <Link href="/admin/enquiries" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#72552A] hover:underline"><ArrowLeft size={15} />All enquiries</Link>
    <div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs tracking-wider text-[#252322]/50">{enquiry.enquiry_reference}</p><h1 className="mt-2 font-heading text-3xl font-light tracking-tight text-[#252322]">{enquiry.customer_name}</h1><p className="mt-2 text-sm text-[#252322]/60">{categories[enquiry.service_category] ?? enquiry.service_category} · {enquiry.event_type}</p></div><span className="border border-[#252322]/15 bg-white px-3 py-2 text-[10px] uppercase tracking-wider text-[#252322]/65">Received {formatDate(enquiry.created_at)}</span></div>

    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="bg-white p-5 sm:p-7" aria-labelledby="event-details-heading"><h2 id="event-details-heading" className="font-heading text-xl text-[#252322]">Event details</h2><dl className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <Detail icon={<CalendarDays size={16} />} label="Date" value={enquiry.event_date ? formatEventDate(enquiry.event_date) : "To be decided"} extra={enquiry.date_flexible ? "Date is flexible" : undefined} />
          <Detail icon={<MapPin size={16} />} label="Location" value={[enquiry.event_city, enquiry.event_location].filter(Boolean).join(" · ")} />
          <Detail icon={<Users size={16} />} label="Expected guests" value={enquiry.expected_guests?.toLocaleString("en-IN") ?? "Not provided"} />
          <Detail icon={<Building2 size={16} />} label="Venue" value={enquiry.venue_status === "not-booked" ? "Not booked" : enquiry.venue_status[0].toUpperCase() + enquiry.venue_status.slice(1)} />
          <Detail label="Estimated budget" value={budgetLabel(enquiry.estimated_budget)} />
          {enquiry.company_name && <Detail label="Company" value={enquiry.company_name} />}
        </dl>{enquiry.event_description && <div className="mt-6 border-t border-[#252322]/10 pt-5"><h3 className="text-[10px] font-medium uppercase tracking-wider text-[#252322]/50">Customer note</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#252322]/75">{enquiry.event_description}</p></div>}</section>

        <section className="bg-white p-5 sm:p-7" aria-labelledby="contact-details-heading"><h2 id="contact-details-heading" className="font-heading text-xl text-[#252322]">Contact details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><a href={`mailto:${enquiry.customer_email}`} className="flex items-center gap-3 text-sm text-[#252322] underline-offset-4 hover:underline"><Mail size={16} className="text-[#9B773F]" />{enquiry.customer_email}</a><a href={`tel:${enquiry.customer_phone}`} className="flex items-center gap-3 text-sm text-[#252322] underline-offset-4 hover:underline"><Phone size={16} className="text-[#9B773F]" />{enquiry.customer_phone}</a></div><p className="mt-4 text-xs text-[#252322]/55">Preferred method: <span className="capitalize">{enquiry.preferred_contact_method}</span> · Consent recorded: {enquiry.consent_to_contact ? "Yes" : "No"}</p></section>
      </div>

      <aside className="space-y-6">
        <section className="bg-white p-5 sm:p-7" aria-labelledby="lead-management-heading"><h2 id="lead-management-heading" className="font-heading text-xl text-[#252322]">Lead management</h2><div className="mt-5 space-y-4"><div><label htmlFor="lead-status" className="block text-xs font-medium text-[#252322]/65">Status</label><select id="lead-status" value={status} onChange={(event) => setStatus(event.target.value as Enquiry["status"])} className="mt-2 w-full border border-[#252322]/15 bg-[#F8F5EF] px-3 py-3 text-sm">{enquiryStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></div><div><label htmlFor="lead-priority" className="block text-xs font-medium text-[#252322]/65">Priority</label><select id="lead-priority" value={priority} onChange={(event) => setPriority(event.target.value as Enquiry["priority"])} className="mt-2 w-full border border-[#252322]/15 bg-[#F8F5EF] px-3 py-3 text-sm">{enquiryPriorities.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div><label htmlFor="lead-notes" className="block text-xs font-medium text-[#252322]/65">Internal notes <span className="font-normal">(private to admins)</span></label><textarea id="lead-notes" rows={6} maxLength={10000} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full resize-y border border-[#252322]/15 bg-[#F8F5EF] px-3 py-3 text-sm leading-6 outline-none focus:border-[#9B773F] focus:ring-2 focus:ring-[#D6AD60]/30" /></div>{error && <p role="alert" className="text-sm text-red-900">{error}</p>}{message && <p role="status" className="text-sm text-green-900">{message}</p>}<button type="button" disabled={saving} onClick={() => void save()} className="w-full bg-[#080808] px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#252322] disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button><p className="text-[10px] leading-5 text-[#252322]/45">Last updated {formatDate(enquiry.updated_at)}</p></div></section>

        <section className="bg-white p-5 sm:p-7" aria-labelledby="activity-heading"><h2 id="activity-heading" className="font-heading text-xl text-[#252322]">Status activity</h2>{payload.activity.length === 0 ? <p className="mt-4 text-xs leading-6 text-[#252322]/55">No status changes have been recorded.</p> : <ol className="mt-5 space-y-4">{payload.activity.map((activity) => <li key={activity.id} className="border-l border-[#D6AD60] pl-4"><p className="text-xs font-medium text-[#252322]">{activity.previous_status?.replaceAll("_", " ") ?? "Created"} → {activity.new_status.replaceAll("_", " ")}</p><p className="mt-1 text-[10px] text-[#252322]/50">{formatDate(activity.created_at)} · Admin {activity.changed_by.slice(0, 8)}</p></li>)}</ol>}</section>
      </aside>
    </div>
  </>;
}

function Detail({ icon, label, value, extra }: { icon?: ReactNode; label: string; value: string; extra?: string }) {
  return <div><dt className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-[#252322]/50">{icon && <span className="text-[#9B773F]">{icon}</span>}{label}</dt><dd className="mt-2 text-sm text-[#252322]">{value}</dd>{extra && <dd className="mt-1 text-xs text-[#252322]/55">{extra}</dd>}</div>;
}

function formatDate(value: string) { return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
function formatEventDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { dateStyle: "long" }); }
function budgetLabel(value: string | null) {
  const labels: Record<string, string> = { "under-10-lakh": "Under ₹10 lakh", "10-25-lakh": "₹10–25 lakh", "25-50-lakh": "₹25–50 lakh", "50-lakh-1-crore": "₹50 lakh–₹1 crore", "over-1-crore": "Above ₹1 crore", undecided: "Not decided yet" };
  return value ? labels[value] ?? value : "Not provided";
}
