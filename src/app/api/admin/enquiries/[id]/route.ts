import { z } from "zod";
import { adminEnquiryUpdateSchema } from "@/features/enquiries/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { readBoundedRequestBody, requestHasSameOrigin } from "@/lib/enquiries/security";

const idSchema = z.uuid();

export async function GET(_request: Request, context: RouteContext<"/api/admin/enquiries/[id]">) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return Response.json({ error: "Enquiry not found." }, { status: 404 });
  const prisma = getPrisma();
  if (!prisma) return Response.json({ error: "Enquiry could not be loaded." }, { status: 503 });
  try {
    const enquiry = await prisma.eventEnquiry.findUnique({ where: { id } });
    if (!enquiry) return Response.json({ error: "Enquiry not found." }, { status: 404 });
    const activity = await prisma.enquiryActivity.findMany({ where: { enquiryId: id }, orderBy: { createdAt: "desc" }, select: { id: true, previousStatus: true, newStatus: true, changedBy: true, createdAt: true } });
    const { enquiryReference, idempotencyKeyHash: _hidden, customerName, customerEmail, customerPhone, preferredContactMethod, companyName, serviceCategory, eventType, eventDate, dateFlexible, eventCity, eventLocation, expectedGuests, estimatedBudget, venueStatus, eventDescription, consentToContact, status, priority, internalNotes, createdAt, updatedAt } = enquiry;
    void _hidden;
    return Response.json({ enquiry: { id, enquiry_reference: enquiryReference, customer_name: customerName, customer_email: customerEmail, customer_phone: customerPhone, preferred_contact_method: preferredContactMethod, company_name: companyName, service_category: serviceCategory, event_type: eventType, event_date: eventDate?.toISOString().slice(0, 10) ?? null, date_flexible: dateFlexible, event_city: eventCity, event_location: eventLocation, expected_guests: expectedGuests, estimated_budget: estimatedBudget, venue_status: venueStatus, event_description: eventDescription, consent_to_contact: consentToContact, status, priority, internal_notes: internalNotes, created_at: createdAt, updated_at: updatedAt }, activity: activity.map(({ previousStatus, newStatus, changedBy, createdAt, ...row }) => ({ ...row, previous_status: previousStatus, new_status: newStatus, changed_by: changedBy, created_at: createdAt })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_enquiry_detail_failed", code: error instanceof Error ? error.name : "unknown" }));
    return Response.json({ error: "Enquiry could not be loaded." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function PATCH(request: Request, context: RouteContext<"/api/admin/enquiries/[id]">) {
  if (!requestHasSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return Response.json({ error: "Enquiry not found." }, { status: 404 });
  const body = await readBoundedRequestBody(request, 12_000).catch(() => null);
  if (!body || body.kind === "empty") return Response.json({ error: "Provide valid update fields." }, { status: 400 });
  if (body.kind === "too-large") return Response.json({ error: "Update is too large." }, { status: 413 });
  let raw: unknown;
  try { raw = JSON.parse(body.text); } catch { return Response.json({ error: "Provide valid update fields." }, { status: 400 }); }
  const update = adminEnquiryUpdateSchema.safeParse(raw);
  if (!update.success) return Response.json({ error: "Provide valid status, priority, or internal notes." }, { status: 422 });
  const prisma = getPrisma();
  if (!prisma) return Response.json({ error: "The update could not be saved." }, { status: 503 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ status: string }>>`SELECT status FROM event_enquiries WHERE id = ${id}::uuid FOR UPDATE`;
      const before = rows[0];
      if (!before) return null;
      const data = { ...(update.data.status ? { status: update.data.status } : {}), ...(update.data.priority ? { priority: update.data.priority } : {}), ...(Object.hasOwn(update.data, "internalNotes") ? { internalNotes: update.data.internalNotes ?? null } : {}) };
      const enquiry = await tx.eventEnquiry.update({ where: { id }, data });
      if (update.data.status && before.status !== update.data.status) await tx.enquiryActivity.create({ data: { enquiryId: id, previousStatus: before.status, newStatus: update.data.status, changedBy: session.email } });
      return enquiry;
    });
    if (!result) return Response.json({ error: "Enquiry not found." }, { status: 404 });
    console.info(JSON.stringify({ event: "admin_enquiry_updated", admin: session.email, enquiryId: id, fields: Object.keys(update.data) }));
    const { enquiryReference, idempotencyKeyHash: _hidden, customerName, customerEmail, customerPhone, preferredContactMethod, companyName, serviceCategory, eventType, eventDate, dateFlexible, eventCity, eventLocation, expectedGuests, estimatedBudget, venueStatus, eventDescription, consentToContact, status, priority, internalNotes, createdAt, updatedAt } = result;
    void _hidden;
    return Response.json({ enquiry: { id, enquiry_reference: enquiryReference, customer_name: customerName, customer_email: customerEmail, customer_phone: customerPhone, preferred_contact_method: preferredContactMethod, company_name: companyName, service_category: serviceCategory, event_type: eventType, event_date: eventDate?.toISOString().slice(0, 10) ?? null, date_flexible: dateFlexible, event_city: eventCity, event_location: eventLocation, expected_guests: expectedGuests, estimated_budget: estimatedBudget, venue_status: venueStatus, event_description: eventDescription, consent_to_contact: consentToContact, status, priority, internal_notes: internalNotes, created_at: createdAt, updated_at: updatedAt } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_enquiry_update_failed", code: error instanceof Error ? error.name : "unknown", admin: session.email, enquiryId: id }));
    return Response.json({ error: "The update could not be saved." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
