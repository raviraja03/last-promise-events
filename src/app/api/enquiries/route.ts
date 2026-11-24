import { randomBytes } from "node:crypto";
import { enquirySubmissionSchema, normalizeEnquiry } from "@/features/enquiries/schema";
import { getPrisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/enquiries/rate-limit";
import { getIdempotencyHash, getRequestIpHash, MAX_ENQUIRY_BODY_BYTES, readBoundedRequestBody, requestHasSameOrigin } from "@/lib/enquiries/security";
import { enquiryNotifier } from "@/lib/enquiries/notifications";

export const runtime = "nodejs";

function errorResponse(status: number, message: string) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function newReference() {
  const suffix = randomBytes(5).toString("hex").toUpperCase();
  return `LPE-${new Date().getUTCFullYear()}-${suffix}`;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_ENQUIRY_BODY_BYTES) return errorResponse(413, "The enquiry is too large. Please shorten your message and try again.");
  if (!requestHasSameOrigin(request)) return errorResponse(403, "This request could not be verified. Please reload the page and try again.");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return errorResponse(415, "Please submit the enquiry using the website form.");

  let raw: unknown;
  try {
    const body = await readBoundedRequestBody(request, MAX_ENQUIRY_BODY_BYTES);
    if (body.kind === "empty") return errorResponse(400, "Please review the form and try again.");
    if (body.kind === "too-large") return errorResponse(413, "The enquiry is too large. Please shorten your message and try again.");
    raw = JSON.parse(body.text);
  } catch {
    return errorResponse(400, "Please review the form and try again.");
  }

  const parsed = enquirySubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Please review the highlighted information.", fields: parsed.error.flatten().fieldErrors }, { status: 422, headers: { "Cache-Control": "no-store" } });
  }
  if (parsed.data.website || Date.now() - parsed.data.formStartedAt < 2500 || Date.now() - parsed.data.formStartedAt > 2 * 60 * 60 * 1000) {
    return errorResponse(400, "Please reload the form and try again.");
  }

  const prisma = getPrisma();
  const idempotencySecret = process.env.IDEMPOTENCY_SECRET;
  const rateSecret = process.env.RATE_LIMIT_HASH_SECRET;
  if (!prisma || !idempotencySecret || !rateSecret) return errorResponse(503, "Enquiry submission is temporarily unavailable. Please try again later.");

  const idempotencyHash = getIdempotencyHash(parsed.data.idempotencyKey, idempotencySecret);
  try {
    const existing = await prisma.eventEnquiry.findUnique({ where: { idempotencyKeyHash: idempotencyHash }, select: { enquiryReference: true } });
    if (existing) return Response.json({ reference: existing.enquiryReference }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "enquiry_idempotency_lookup_failed", code: error instanceof Error ? error.name : "unknown" }));
    return errorResponse(503, "Enquiry submission is temporarily unavailable. Please try again later.");
  }

  const ipHash = getRequestIpHash(request, rateSecret);
  try {
    const allowed = await consumeRateLimit(`enquiry:${ipHash}`, 5, 3600);
    if (!allowed) return errorResponse(429, "We have received several requests from this connection. Please try again later.");
  } catch (error) {
    console.error(JSON.stringify({ event: "enquiry_rate_limit_failed", code: error instanceof Error ? error.name : "unknown" }));
    return errorResponse(503, "Enquiry submission is temporarily unavailable. Please try again later.");
  }

  let saved: { id: string; enquiryReference: string } | null = null;
  for (let attempt = 0; attempt < 3 && !saved; attempt += 1) {
    try {
      const normalized = normalizeEnquiry(parsed.data.enquiry);
      saved = await prisma.eventEnquiry.create({ data: {
        customerName: normalized.customer_name, customerEmail: normalized.customer_email, customerPhone: normalized.customer_phone,
        preferredContactMethod: normalized.preferred_contact_method, companyName: normalized.company_name,
        serviceCategory: normalized.service_category, eventType: normalized.event_type,
        eventDate: normalized.event_date ? new Date(`${normalized.event_date}T00:00:00.000Z`) : null,
        dateFlexible: normalized.date_flexible, eventCity: normalized.event_city, eventLocation: normalized.event_location,
        expectedGuests: normalized.expected_guests, estimatedBudget: normalized.estimated_budget,
        venueStatus: normalized.venue_status, eventDescription: normalized.event_description,
        consentToContact: normalized.consent_to_contact, enquiryReference: newReference(), idempotencyKeyHash: idempotencyHash,
      }, select: { id: true, enquiryReference: true } });
    } catch (error) {
      const duplicate = await prisma.eventEnquiry.findUnique({ where: { idempotencyKeyHash: idempotencyHash }, select: { enquiryReference: true } }).catch(() => null);
      if (duplicate) return Response.json({ reference: duplicate.enquiryReference }, { status: 200, headers: { "Cache-Control": "no-store" } });
      console.error(JSON.stringify({ event: "enquiry_insert_failed", code: error instanceof Error ? error.name : "unknown" }));
      return errorResponse(503, "Enquiry submission is temporarily unavailable. Please try again later.");
    }
  }

  if (!saved) return errorResponse(503, "Enquiry submission is temporarily unavailable. Please try again later.");

  console.info(JSON.stringify({ event: "event_enquiry_created", enquiryId: saved.id, reference: saved.enquiryReference, category: parsed.data.enquiry.serviceCategory }));
  await enquiryNotifier.notifyNewEnquiry({ reference: saved.enquiryReference, category: parsed.data.enquiry.serviceCategory });
  return Response.json({ reference: saved.enquiryReference }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
