"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CalendarDays, MapPin, Mail, Phone } from "lucide-react";
import {
  budgetRanges,
  enquiryDetailsSchema,
  preferredContactMethods,
  serviceCategories,
  venueStatuses,
  type EnquiryDetails,
} from "@/features/enquiries/schema";

const categoryOptions = [
  { value: "weddings", label: "Weddings & Celebrations" },
  { value: "corporate-events", label: "Corporate & Brand Events" },
  { value: "private-events", label: "Private & Social Events" },
  { value: "destination-events", label: "Destination Experiences" },
  { value: "digital-experiences", label: "Digital Event Experiences" },
] as const;

const budgetLabels: Record<(typeof budgetRanges)[number], string> = {
  "under-10-lakh": "Under ₹10 lakh",
  "10-25-lakh": "₹10–25 lakh",
  "25-50-lakh": "₹25–50 lakh",
  "50-lakh-1-crore": "₹50 lakh–₹1 crore",
  "over-1-crore": "Above ₹1 crore",
  undecided: "Not decided yet",
};

type FormState = Omit<EnquiryDetails, "expectedGuests" | "consentToContact" | "serviceCategory" | "venueStatus"> & {
  expectedGuests: string;
  consentToContact: boolean;
  serviceCategory: EnquiryDetails["serviceCategory"] | "";
  venueStatus: EnquiryDetails["venueStatus"] | "";
};

const emptyForm: FormState = {
  serviceCategory: "",
  eventType: "",
  eventDate: "",
  dateFlexible: false,
  eventCity: "",
  eventLocation: "",
  expectedGuests: "",
  estimatedBudget: "",
  venueStatus: "",
  eventDescription: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  preferredContactMethod: "email",
  companyName: "",
  consentToContact: false,
};

type Step = 0 | 1 | 2 | 3;
type FieldErrors = Record<string, string>;

const stepLabels = ["Event category", "Event details", "Your details", "Review"];

export default function EnquiryForm({ initialCategory }: { initialCategory?: string }) {
  const reducedMotion = useReducedMotion();
  const selectedCategory = serviceCategories.includes(initialCategory as (typeof serviceCategories)[number])
    ? (initialCategory as EnquiryDetails["serviceCategory"])
    : "";
  const [form, setForm] = useState<FormState>({ ...emptyForm, serviceCategory: selectedCategory });
  const [step, setStep] = useState<Step>(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [idempotencyKey] = useState(() => globalThis.crypto.randomUUID());
  const [formStartedAt] = useState(() => Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (step > 0 || reference) headingRef.current?.focus();
  }, [step, reference]);

  const categoryName = useMemo(
    () => categoryOptions.find((item) => item.value === form.serviceCategory)?.label ?? "",
    [form.serviceCategory],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setFormError("");
  }

  function showErrors(fields: Record<string, string>) {
    setErrors(fields);
    const first = Object.keys(fields)[0];
    if (first) requestAnimationFrame(() => {
      const control = document.getElementById(`enquiry-${first}`) ?? document.querySelector<HTMLInputElement>(`[name="${first}"]`);
      control?.focus();
    });
  }

  function validateStep(currentStep: Step) {
    const next: FieldErrors = {};
    if (currentStep === 0 && !form.serviceCategory) next.serviceCategory = "Choose an event category to continue.";
    if (currentStep === 1) {
      if (form.eventType.trim().length < 2) next.eventType = "Tell us what kind of event you are planning.";
      if (form.eventCity.trim().length < 2) next.eventCity = "Add the event city.";
      if (!form.venueStatus) next.venueStatus = "Choose the venue status that best describes your plans.";
      if (form.eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.eventDate)) next.eventDate = "Choose a valid date.";
      if (form.expectedGuests !== "" && (!Number.isInteger(Number(form.expectedGuests)) || Number(form.expectedGuests) < 1 || Number(form.expectedGuests) > 100000)) next.expectedGuests = "Enter a guest count between 1 and 100,000.";
      if (form.eventDescription && form.eventDescription.length > 5000) next.eventDescription = "Keep your note under 5,000 characters.";
    }
    if (currentStep === 2) {
      if (form.customerName.trim().length < 2) next.customerName = "Enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) next.customerEmail = "Enter a valid email address.";
      if (!/^\+[1-9]\d{7,14}$/.test(form.customerPhone.replace(/[\s().-]/g, ""))) next.customerPhone = "Include your country code, for example +91 98765 43210.";
      if (!form.consentToContact) next.consentToContact = "Please agree to be contacted about this enquiry.";
    }
    showErrors(next);
    return Object.keys(next).length === 0;
  }

  function continueToReview() {
    const parsed = enquiryDetailsSchema.safeParse({
      ...form,
      expectedGuests: form.expectedGuests === "" ? "" : Number(form.expectedGuests),
    });
    if (!parsed.success) {
      const fields = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
      showErrors(fields);
      const order = ["serviceCategory", "eventType", "eventCity", "venueStatus", "customerName", "customerEmail", "customerPhone", "consentToContact"];
      const firstStep = order.find((field) => fields[field]);
      if (firstStep) setStep(firstStep === "serviceCategory" ? 0 : ["eventType", "eventCity", "venueStatus"].includes(firstStep) ? 1 : 2);
      return false;
    }
    return true;
  }

  async function submitEnquiry() {
    if (!continueToReview()) return;
    setBusy(true);
    setFormError("");
    try {
      const payload = {
        ...form,
        expectedGuests: form.expectedGuests === "" ? "" : Number(form.expectedGuests),
      };
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiry: payload, idempotencyKey, formStartedAt, website: "" }),
      });
      const result = await response.json().catch(() => ({})) as { reference?: string; error?: string };
      if (!response.ok || !result.reference) {
        setFormError(result.error ?? "We could not submit your enquiry just now. Please try again.");
        return;
      }
      setReference(result.reference);
    } catch {
      setFormError("We could not connect securely. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass = "mt-2 w-full border border-[#252322]/20 bg-white/70 px-4 py-3.5 text-sm text-[#252322] outline-none transition placeholder:text-[#252322]/40 focus:border-[#9B773F] focus:ring-2 focus:ring-[#D6AD60]/30";
  const labelClass = "block text-sm font-medium text-[#252322]";

  function fieldError(name: keyof EnquiryDetails) {
    return errors[name] ? <p id={`enquiry-${name}-error`} className="mt-2 text-xs text-red-800" role="alert">{errors[name]}</p> : null;
  }

  function errorAttrs(name: keyof EnquiryDetails) {
    return errors[name] ? { id: `enquiry-${name}`, "aria-invalid": true as const, "aria-describedby": `enquiry-${name}-error` } : { id: `enquiry-${name}` };
  }

  if (reference) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center sm:py-32" aria-live="polite">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#D6AD60]/20 text-[#72552A]"><Check size={24} /></span>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-[#9B773F]">Enquiry received</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 font-heading text-3xl font-light leading-tight tracking-tight text-[#252322] sm:text-4xl">Thank you for sharing your plans.</h1>
        <p className="mt-5 text-sm leading-7 text-[#252322]/70">Our team has received your enquiry. Keep this reference for your records.</p>
        <p className="mx-auto mt-8 inline-flex border border-[#252322]/15 px-5 py-3 font-mono text-sm tracking-wider text-[#252322]">{reference}</p>
        <p className="mt-6 text-xs text-[#252322]/55">We have not sent an email or WhatsApp confirmation.</p>
      </section>
    );
  }

  const panelMotion = reducedMotion ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 1 } } : {
    initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 },
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-36 sm:px-8 md:gap-16 md:px-12 md:pb-32 md:pt-40 lg:grid-cols-[0.75fr_1.25fr] lg:px-16">
      <aside className="max-w-md lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9B773F]">A considered beginning</p>
        <h1 className="mt-5 font-heading text-4xl font-light leading-[1.12] tracking-tight text-[#252322] sm:text-5xl">Let&apos;s talk about what you&apos;re imagining.</h1>
        <p className="mt-6 text-sm leading-8 text-[#252322]/65">A few details help us understand the occasion and the experience you have in mind. Share only what you know so far.</p>
        <div className="mt-10 border-t border-[#252322]/15 pt-6 text-xs leading-6 text-[#252322]/60">
          <p>Prefer a conversation first?</p>
          <a href="mailto:hello@lastpromiseevents.com" className="mt-1 inline-block text-[#72552A] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B773F]">Email our team</a>
        </div>
      </aside>

      <div className="min-w-0 bg-white/65 px-5 py-7 shadow-[0_18px_70px_rgba(37,35,34,0.06)] sm:px-8 sm:py-9 lg:px-10">
        <ol aria-label="Enquiry steps" className="mb-9 grid grid-cols-4 gap-2">
          {stepLabels.map((label, index) => {
            const complete = index < step;
            const current = index === step;
            return <li key={label} aria-current={current ? "step" : undefined} className="min-w-0">
              <div className={`h-1 ${complete || current ? "bg-[#9B773F]" : "bg-[#252322]/10"}`} />
              <p className={`mt-2 truncate text-[10px] leading-4 sm:text-xs ${current ? "font-semibold text-[#252322]" : "text-[#252322]/50"}`}><span className="mr-1">0{index + 1}</span>{label}</p>
            </li>;
          })}
        </ol>

        <form onSubmit={(event) => { event.preventDefault(); void submitEnquiry(); }} noValidate>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} {...panelMotion} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
              <h2 ref={headingRef} tabIndex={-1} className="font-heading text-2xl font-normal tracking-tight text-[#252322] focus:outline-none sm:text-3xl">
                {step === 0 ? "What are we celebrating?" : step === 1 ? "A little about the event" : step === 2 ? "Who should we be in touch with?" : "Please review your enquiry"}
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#252322]/55">{step === 0 ? "Choose the experience that feels closest." : step === 1 ? "Approximate details are welcome; you can leave optional fields blank." : step === 2 ? "Your contact details stay private and are used only for this enquiry." : "You can return to any step before sending."}</p>

              {step === 0 && <fieldset aria-required="true" aria-describedby={errors.serviceCategory ? "enquiry-serviceCategory-error" : undefined} className="mt-7 space-y-3">
                <legend className="sr-only">Event category</legend>
                {categoryOptions.map((option) => {
                  const checked = form.serviceCategory === option.value;
                  return <label key={option.value} className={`flex cursor-pointer items-center justify-between gap-4 border px-4 py-4 transition focus-within:ring-2 focus-within:ring-[#D6AD60]/50 ${checked ? "border-[#9B773F] bg-[#D6AD60]/10" : "border-[#252322]/15 hover:border-[#9B773F]/60"}`}>
                    <span><span className="block text-sm font-medium text-[#252322]">{option.label}</span><span className="mt-1 block text-xs text-[#252322]/55">{categoryDescriptions[option.value]}</span></span>
                    <input id={`enquiry-serviceCategory-${option.value}`} type="radio" name="serviceCategory" value={option.value} checked={checked} onChange={() => update("serviceCategory", option.value)} className="size-4 accent-[#72552A]" />
                  </label>;
                })}
                {fieldError("serviceCategory")}
              </fieldset>}

              {step === 1 && <div className="mt-7 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className={labelClass} htmlFor="enquiry-eventType">What kind of event? <span aria-hidden="true">*</span></label><input {...errorAttrs("eventType")} aria-required="true" value={form.eventType} onChange={(e) => update("eventType", e.target.value)} autoComplete="off" placeholder="For example, a wedding reception" className={inputClass} />{fieldError("eventType")}</div>
                <div><label className={labelClass} htmlFor="enquiry-eventDate">Event date</label><input {...errorAttrs("eventDate")} type="date" value={form.eventDate ?? ""} onChange={(e) => update("eventDate", e.target.value)} className={inputClass} />{fieldError("eventDate")}</div>
                <div className="flex items-end pb-1"><label className="flex items-center gap-3 py-3 text-sm text-[#252322]/75"><input type="checkbox" checked={form.dateFlexible} onChange={(e) => update("dateFlexible", e.target.checked)} className="size-4 accent-[#72552A]" />Our date is flexible</label></div>
                <div><label className={labelClass} htmlFor="enquiry-eventCity">City <span aria-hidden="true">*</span></label><input {...errorAttrs("eventCity")} aria-required="true" value={form.eventCity} onChange={(e) => update("eventCity", e.target.value)} autoComplete="address-level2" placeholder="Jaipur" className={inputClass} />{fieldError("eventCity")}</div>
                <div><label className={labelClass} htmlFor="enquiry-eventLocation">Venue or location <span className="font-normal text-[#252322]/45">(optional)</span></label><input {...errorAttrs("eventLocation")} value={form.eventLocation ?? ""} onChange={(e) => update("eventLocation", e.target.value)} placeholder="Venue name or area" className={inputClass} />{fieldError("eventLocation")}</div>
                <div><label className={labelClass} htmlFor="enquiry-expectedGuests">Expected guests <span className="font-normal text-[#252322]/45">(optional)</span></label><input {...errorAttrs("expectedGuests")} type="number" min="1" max="100000" inputMode="numeric" value={form.expectedGuests} onChange={(e) => update("expectedGuests", e.target.value)} placeholder="Approximate number" className={inputClass} />{fieldError("expectedGuests")}</div>
                <div><label className={labelClass} htmlFor="enquiry-estimatedBudget">Estimated budget <span className="font-normal text-[#252322]/45">(optional)</span></label><select {...errorAttrs("estimatedBudget")} value={form.estimatedBudget ?? ""} onChange={(e) => update("estimatedBudget", e.target.value as EnquiryDetails["estimatedBudget"])} className={inputClass}><option value="">Choose a range</option>{budgetRanges.map((range) => <option value={range} key={range}>{budgetLabels[range]}</option>)}</select>{fieldError("estimatedBudget")}</div>
                <fieldset aria-required="true" aria-describedby={errors.venueStatus ? "enquiry-venueStatus-error" : undefined} className="sm:col-span-2"><legend className={`${labelClass} mb-2`}>Venue status <span aria-hidden="true">*</span></legend><div className="flex flex-wrap gap-2">{venueStatuses.map((venue) => <label key={venue} className={`cursor-pointer border px-4 py-3 text-xs transition focus-within:ring-2 focus-within:ring-[#D6AD60]/50 ${form.venueStatus === venue ? "border-[#9B773F] bg-[#D6AD60]/10" : "border-[#252322]/15"}`}><input type="radio" name="venueStatus" value={venue} checked={form.venueStatus === venue} onChange={() => update("venueStatus", venue)} className="sr-only" />{venue === "booked" ? "Booked" : venue === "not-booked" ? "Not booked" : "Undecided"}</label>)}</div>{fieldError("venueStatus")}</fieldset>
                <div className="sm:col-span-2"><label className={labelClass} htmlFor="enquiry-eventDescription">Anything else you&apos;d like us to know? <span className="font-normal text-[#252322]/45">(optional)</span></label><textarea {...errorAttrs("eventDescription")} rows={4} maxLength={5000} value={form.eventDescription ?? ""} onChange={(e) => update("eventDescription", e.target.value)} placeholder="Share your ideas, requirements, or questions." className={`${inputClass} resize-y`} />{fieldError("eventDescription")}</div>
              </div>}

              {step === 2 && <div className="mt-7 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <div><label className={labelClass} htmlFor="enquiry-customerName">Full name <span aria-hidden="true">*</span></label><input {...errorAttrs("customerName")} aria-required="true" autoComplete="name" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} className={inputClass} />{fieldError("customerName")}</div>
                <div><label className={labelClass} htmlFor="enquiry-companyName">Company <span className="font-normal text-[#252322]/45">(optional)</span></label><input {...errorAttrs("companyName")} autoComplete="organization" value={form.companyName ?? ""} onChange={(e) => update("companyName", e.target.value)} className={inputClass} />{fieldError("companyName")}</div>
                <div><label className={labelClass} htmlFor="enquiry-customerEmail">Email address <span aria-hidden="true">*</span></label><input {...errorAttrs("customerEmail")} aria-required="true" type="email" autoComplete="email" inputMode="email" value={form.customerEmail} onChange={(e) => update("customerEmail", e.target.value)} className={inputClass} />{fieldError("customerEmail")}</div>
                <div><label className={labelClass} htmlFor="enquiry-customerPhone">Phone with country code <span aria-hidden="true">*</span></label><input {...errorAttrs("customerPhone")} aria-required="true" type="tel" autoComplete="tel" inputMode="tel" value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} placeholder="+91 98765 43210" className={inputClass} />{fieldError("customerPhone")}</div>
                <fieldset className="sm:col-span-2"><legend className={`${labelClass} mb-2`}>How would you prefer we contact you?</legend><div className="flex flex-wrap gap-2">{preferredContactMethods.map((method) => <label key={method} className={`cursor-pointer border px-4 py-3 text-xs capitalize transition focus-within:ring-2 focus-within:ring-[#D6AD60]/50 ${form.preferredContactMethod === method ? "border-[#9B773F] bg-[#D6AD60]/10" : "border-[#252322]/15"}`}><input type="radio" name="preferredContactMethod" checked={form.preferredContactMethod === method} onChange={() => update("preferredContactMethod", method)} className="sr-only" />{method}</label>)}</div></fieldset>
                <div className="sm:col-span-2"> <label className="flex items-start gap-3 text-xs leading-6 text-[#252322]/75"><input {...errorAttrs("consentToContact")} aria-required="true" type="checkbox" checked={form.consentToContact} onChange={(e) => update("consentToContact", e.target.checked)} className="mt-1 size-4 shrink-0 accent-[#72552A]" /><span>I agree to be contacted about this event enquiry.</span></label>{fieldError("consentToContact")}</div>
              </div>}

              {step === 3 && <div className="mt-7 divide-y divide-[#252322]/10 border-y border-[#252322]/10">
                <ReviewRow icon={<CalendarDays size={16} />} label="Experience" value={categoryName} onEdit={() => setStep(0)} disabled={busy} />
                <ReviewRow icon={<MapPin size={16} />} label="Event" value={[form.eventType, form.eventCity, form.eventLocation].filter(Boolean).join(" · ")} detail={[form.eventDate ? new Date(`${form.eventDate}T12:00:00`).toLocaleDateString("en-IN", { dateStyle: "long" }) : "Date to be decided", form.dateFlexible ? "Flexible date" : "", form.expectedGuests ? `${form.expectedGuests} guests` : "", form.estimatedBudget ? budgetLabels[form.estimatedBudget as keyof typeof budgetLabels] : "", `Venue ${form.venueStatus === "booked" ? "booked" : form.venueStatus === "not-booked" ? "not booked" : "undecided"}`].filter(Boolean).join(" · ")} onEdit={() => setStep(1)} disabled={busy} />
                {form.eventDescription && <ReviewRow label="Your note" value={form.eventDescription} onEdit={() => setStep(1)} disabled={busy} />}
                <ReviewRow icon={<Mail size={16} />} label="Contact" value={form.customerName} detail={[form.customerEmail, form.customerPhone, form.companyName].filter(Boolean).join(" · ")} onEdit={() => setStep(2)} disabled={busy} />
                <ReviewRow icon={<Phone size={16} />} label="Preferred contact" value={form.preferredContactMethod} onEdit={() => setStep(2)} disabled={busy} />
              </div>}

              <input type="text" name="website" value="" onChange={() => undefined} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[10000px] h-px w-px opacity-0" />
              {formError && <p role="alert" className="mt-6 border-l-2 border-red-800 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">{formError}</p>}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#252322]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                {step > 0 ? <button type="button" disabled={busy} onClick={() => { setStep((step - 1) as Step); setFormError(""); }} className="inline-flex min-h-12 items-center justify-center gap-2 px-3 text-xs font-medium uppercase tracking-[0.12em] text-[#252322]/65 hover:text-[#252322] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B773F] disabled:opacity-50"><ArrowLeft size={16} />Back</button> : <span />}
                {step < 3 ? <button type="button" onClick={() => { if (validateStep(step)) { setStep((step + 1) as Step); setFormError(""); } }} className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#080808] px-6 text-xs font-medium uppercase tracking-[0.12em] text-[#F8F5EF] transition hover:bg-[#252322] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B773F]">{step === 2 ? "Review enquiry" : "Continue"}<ArrowRight size={16} /></button> : <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#080808] px-6 text-xs font-medium uppercase tracking-[0.12em] text-[#F8F5EF] transition hover:bg-[#252322] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B773F] disabled:cursor-wait disabled:opacity-60">{busy ? "Sending enquiry…" : "Send enquiry"}<ArrowRight size={16} /></button>}
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
}

const categoryDescriptions: Record<(typeof serviceCategories)[number], string> = {
  weddings: "Weddings, engagements and celebrations",
  "corporate-events": "Conferences, launches and company gatherings",
  "private-events": "Personal milestones and intimate occasions",
  "destination-events": "Celebrations shaped around a destination",
  "digital-experiences": "Invitations, event websites and digital journeys",
};

function ReviewRow({ icon, label, value, detail, onEdit, disabled }: { icon?: ReactNode; label: string; value: string; detail?: string; onEdit: () => void; disabled: boolean }) {
  return <div className="flex items-start gap-3 py-5 sm:gap-4">
    <span className="mt-0.5 text-[#9B773F]">{icon}</span>
    <div className="min-w-0 flex-1"><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#252322]/50">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm font-medium text-[#252322]">{value || "Not provided"}</p>{detail && <p className="mt-1 break-words text-xs leading-6 text-[#252322]/60">{detail}</p>}</div>
    <button type="button" disabled={disabled} onClick={onEdit} className="shrink-0 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#72552A] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B773F] disabled:opacity-50">Edit</button>
  </div>;
}
