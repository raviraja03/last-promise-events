import test from "node:test";
import assert from "node:assert/strict";
import {
  enquiryDetailsSchema,
  enquirySubmissionSchema,
  normalizeEnquiry,
  resolveServiceCategory,
} from "../src/features/enquiries/schema.ts";
import { hashEnquiryIdempotencyKey, hashClientIp } from "../src/features/enquiries/idempotency.ts";

const validEnquiry = {
  serviceCategory: "weddings",
  eventType: "Wedding celebration",
  eventDate: "",
  dateFlexible: true,
  eventCity: "Jaipur",
  eventLocation: "",
  expectedGuests: "",
  estimatedBudget: "",
  venueStatus: "undecided",
  eventDescription: "",
  customerName: "Aarav Mehta",
  customerEmail: "  AARAV@example.com ",
  customerPhone: " +91 98765 43210 ",
  preferredContactMethod: "whatsapp",
  companyName: "",
  consentToContact: true,
};

test("valid enquiry normalizes email, phone, and optional fields", () => {
  const parsed = enquiryDetailsSchema.parse(validEnquiry);
  const record = normalizeEnquiry(parsed);
  assert.equal(record.customer_email, "aarav@example.com");
  assert.equal(record.customer_phone, "+919876543210");
  assert.equal(record.event_date, null);
  assert.equal(record.event_location, null);
  assert.equal(record.expected_guests, null);
  assert.equal(record.company_name, null);
  assert.equal(record.date_flexible, true);
});

test("optional event details can be omitted", () => {
  const optional = new Set(["eventDate", "eventLocation", "expectedGuests", "estimatedBudget", "eventDescription", "companyName"]);
  const required = Object.fromEntries(Object.entries(validEnquiry).filter(([key]) => !optional.has(key)));
  assert.equal(enquiryDetailsSchema.safeParse(required).success, true);
});

test("phone must include a valid international country code", () => {
  assert.equal(enquiryDetailsSchema.safeParse({ ...validEnquiry, customerPhone: "9876543210" }).success, false);
  assert.equal(enquiryDetailsSchema.safeParse({ ...validEnquiry, customerPhone: "+01234567890" }).success, false);
});

test("contact consent and a valid email are required", () => {
  assert.equal(enquiryDetailsSchema.safeParse({ ...validEnquiry, consentToContact: false }).success, false);
  assert.equal(enquiryDetailsSchema.safeParse({ ...validEnquiry, customerEmail: "not-an-email" }).success, false);
});

test("public enquiry schema rejects administrative fields", () => {
  const parsed = enquiryDetailsSchema.safeParse({ ...validEnquiry, status: "CONFIRMED", priority: "URGENT", internalNotes: "Injected" });
  assert.equal(parsed.success, false);
});

test("service query preselection accepts only known slugs", () => {
  assert.equal(resolveServiceCategory("destination-events"), "destination-events");
  assert.equal(resolveServiceCategory("admin"), undefined);
  assert.equal(resolveServiceCategory(undefined), undefined);
});

test("submission requires an idempotency UUID and honeypot field is empty", () => {
  const base = { enquiry: validEnquiry, idempotencyKey: "03a4f2e6-0a1c-4f41-a0a7-765c1f37bb16", formStartedAt: Date.now() - 5000, website: "" };
  assert.equal(enquirySubmissionSchema.safeParse(base).success, true);
  assert.equal(enquirySubmissionSchema.safeParse({ ...base, idempotencyKey: "bad" }).success, false);
  assert.equal(enquirySubmissionSchema.safeParse({ ...base, website: "bot" }).success, false);
});

test("idempotency and IP hashes are keyed, stable, and do not persist raw input", () => {
  const key = "03a4f2e6-0a1c-4f41-a0a7-765c1f37bb16";
  const first = hashEnquiryIdempotencyKey(key, "server-secret");
  assert.equal(first, hashEnquiryIdempotencyKey(key, "server-secret"));
  assert.notEqual(first, hashEnquiryIdempotencyKey(key, "rotated-secret"));
  assert.notEqual(first, key);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(hashClientIp("203.0.113.10", "server-secret").length, 64);
});
