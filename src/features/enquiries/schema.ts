import { z } from "zod";

export const serviceCategories = [
  "weddings",
  "corporate-events",
  "private-events",
  "destination-events",
  "digital-experiences",
] as const;

export const enquiryStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "CONFIRMED",
  "LOST",
  "ARCHIVED",
] as const;

export const enquiryPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const preferredContactMethods = ["email", "phone", "whatsapp"] as const;
export const venueStatuses = ["booked", "not-booked", "undecided"] as const;
export const budgetRanges = [
  "under-10-lakh",
  "10-25-lakh",
  "25-50-lakh",
  "50-lakh-1-crore",
  "over-1-crore",
  "undecided",
] as const;

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const enquiryDetailsSchema = z.strictObject({
  serviceCategory: z.enum(serviceCategories),
  eventType: z.string().trim().min(2, "Tell us what kind of event you are planning.").max(120),
  eventDate: z.union([z.iso.date(), z.literal("")]).optional(),
  dateFlexible: z.boolean(),
  eventCity: z.string().trim().min(2, "Add the event city.").max(120),
  eventLocation: optionalText(180),
  expectedGuests: z.union([z.number().int().min(1).max(100000), z.literal("")]).optional(),
  estimatedBudget: z.union([z.enum(budgetRanges), z.literal("")]).optional(),
  venueStatus: z.enum(venueStatuses),
  eventDescription: optionalText(5000),
  customerName: z.string().trim().min(2, "Enter your full name.").max(160),
  customerEmail: z.string().trim().email("Enter a valid email address.").max(320).transform((value) => value.toLowerCase()),
  customerPhone: z.string().trim().transform((value) => value.replace(/[\s().-]/g, "")).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Use an international number with country code, for example +91 98765 43210.")),
  preferredContactMethod: z.enum(preferredContactMethods),
  companyName: optionalText(180),
  consentToContact: z.literal(true, { error: "Please agree to be contacted about this enquiry." }),
});

export const enquirySubmissionSchema = z.strictObject({
  enquiry: enquiryDetailsSchema,
  idempotencyKey: z.uuid(),
  website: z.string().max(0).optional(),
  formStartedAt: z.number().int().positive(),
});

export const adminEnquiryUpdateSchema = z.strictObject({
  status: z.enum(enquiryStatuses).optional(),
  priority: z.enum(enquiryPriorities).optional(),
  internalNotes: z.string().max(10000).optional(),
}).refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");

export type EnquiryDetails = z.infer<typeof enquiryDetailsSchema>;
export type EnquirySubmission = z.infer<typeof enquirySubmissionSchema>;
export type EnquiryStatus = (typeof enquiryStatuses)[number];
export type EnquiryPriority = (typeof enquiryPriorities)[number];

export function resolveServiceCategory(value?: string) {
  return serviceCategories.find((category) => category === value);
}

export function normalizeEnquiry(input: EnquiryDetails) {
  return {
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail.trim().toLowerCase(),
    customer_phone: input.customerPhone.replace(/[\s().-]/g, ""),
    preferred_contact_method: input.preferredContactMethod,
    company_name: input.companyName?.trim() || null,
    service_category: input.serviceCategory,
    event_type: input.eventType.trim(),
    event_date: input.eventDate || null,
    date_flexible: input.dateFlexible,
    event_city: input.eventCity.trim(),
    event_location: input.eventLocation?.trim() || null,
    expected_guests: input.expectedGuests === "" || input.expectedGuests === undefined ? null : Number(input.expectedGuests),
    estimated_budget: input.estimatedBudget || null,
    venue_status: input.venueStatus,
    event_description: input.eventDescription?.trim() || null,
    consent_to_contact: input.consentToContact,
  };
}
