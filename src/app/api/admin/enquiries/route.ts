import { enquiryStatuses, serviceCategories } from "@/features/enquiries/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

const PAGE_SIZE = 20;
const searchPattern = /^[A-Za-z0-9@.+ _-]{0,100}$/;
const sortMap = { created_at: "createdAt", updated_at: "updatedAt", status: "status", priority: "priority", service_category: "serviceCategory", event_city: "eventCity" } as const;

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const prisma = getPrisma();
  if (!prisma) return Response.json({ error: "Enquiries could not be loaded." }, { status: 503 });
  const params = new URL(request.url).searchParams;
  const page = Math.trunc(Math.max(1, Math.min(10000, Number(params.get("page")) || 1)));
  const status = params.get("status") || "";
  const category = params.get("category") || "";
  const search = (params.get("search") || "").trim();
  if (status && !enquiryStatuses.includes(status as (typeof enquiryStatuses)[number])) return Response.json({ error: "Invalid status filter." }, { status: 400 });
  if (category && !serviceCategories.includes(category as (typeof serviceCategories)[number])) return Response.json({ error: "Invalid category filter." }, { status: 400 });
  if (!searchPattern.test(search)) return Response.json({ error: "Search contains unsupported characters." }, { status: 400 });
  const requested = params.get("sort") || "created_at";
  const sort: "createdAt" | "updatedAt" | "status" | "priority" | "serviceCategory" | "eventCity" = Object.hasOwn(sortMap, requested) ? sortMap[requested as keyof typeof sortMap] : "createdAt";
  const where = { ...(status ? { status } : {}), ...(category ? { serviceCategory: category } : {}), ...(search ? { OR: ["customerName", "customerEmail", "enquiryReference", "eventCity"].map((field) => ({ [field]: { contains: search, mode: "insensitive" as const } })) } : {}) };
  try {
    const [items, count] = await Promise.all([
      prisma.eventEnquiry.findMany({ where, orderBy: { [sort]: params.get("direction") === "asc" ? "asc" : "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
      prisma.eventEnquiry.count({ where }),
    ]);
    return Response.json({ items: items.map(({ id, enquiryReference, customerName, serviceCategory, eventType, eventDate, eventCity, expectedGuests, status: itemStatus, priority, createdAt, updatedAt }) => ({ id, enquiry_reference: enquiryReference, customer_name: customerName, service_category: serviceCategory, event_type: eventType, event_date: eventDate?.toISOString().slice(0, 10) ?? null, event_city: eventCity, expected_guests: expectedGuests, status: itemStatus, priority, created_at: createdAt, updated_at: updatedAt })), count, page, pageSize: PAGE_SIZE, pages: Math.ceil(count / PAGE_SIZE) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_enquiry_list_failed", code: error instanceof Error ? error.name : "unknown" }));
    return Response.json({ error: "Enquiries could not be loaded." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
