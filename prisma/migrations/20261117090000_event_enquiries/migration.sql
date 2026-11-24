CREATE TABLE "event_enquiries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "enquiry_reference" VARCHAR(32) NOT NULL,
  "idempotency_key_hash" VARCHAR(64) NOT NULL,
  "customer_name" VARCHAR(160) NOT NULL,
  "customer_email" VARCHAR(320) NOT NULL,
  "customer_phone" VARCHAR(16) NOT NULL,
  "preferred_contact_method" VARCHAR(16) NOT NULL,
  "company_name" VARCHAR(180),
  "service_category" VARCHAR(32) NOT NULL,
  "event_type" VARCHAR(120) NOT NULL,
  "event_date" DATE,
  "date_flexible" BOOLEAN NOT NULL DEFAULT false,
  "event_city" VARCHAR(120) NOT NULL,
  "event_location" VARCHAR(180),
  "expected_guests" INTEGER,
  "estimated_budget" VARCHAR(32),
  "venue_status" VARCHAR(16) NOT NULL,
  "event_description" VARCHAR(5000),
  "consent_to_contact" BOOLEAN NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'NEW',
  "priority" VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
  "internal_notes" VARCHAR(10000),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "event_enquiries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "event_enquiries_reference_key" UNIQUE ("enquiry_reference"),
  CONSTRAINT "event_enquiries_idempotency_key" UNIQUE ("idempotency_key_hash"),
  CONSTRAINT "event_enquiries_name_length" CHECK (char_length("customer_name") BETWEEN 2 AND 160),
  CONSTRAINT "event_enquiries_phone_format" CHECK ("customer_phone" ~ '^\+[1-9][0-9]{7,14}$'),
  CONSTRAINT "event_enquiries_contact_method" CHECK ("preferred_contact_method" IN ('email', 'phone', 'whatsapp')),
  CONSTRAINT "event_enquiries_service_category" CHECK ("service_category" IN ('weddings', 'corporate-events', 'private-events', 'destination-events', 'digital-experiences')),
  CONSTRAINT "event_enquiries_event_type_length" CHECK (char_length("event_type") BETWEEN 2 AND 120),
  CONSTRAINT "event_enquiries_guest_count" CHECK ("expected_guests" IS NULL OR "expected_guests" BETWEEN 1 AND 100000),
  CONSTRAINT "event_enquiries_budget" CHECK ("estimated_budget" IS NULL OR "estimated_budget" IN ('under-10-lakh', '10-25-lakh', '25-50-lakh', '50-lakh-1-crore', 'over-1-crore', 'undecided')),
  CONSTRAINT "event_enquiries_venue_status" CHECK ("venue_status" IN ('booked', 'not-booked', 'undecided')),
  CONSTRAINT "event_enquiries_consent" CHECK ("consent_to_contact"),
  CONSTRAINT "event_enquiries_status" CHECK ("status" IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONFIRMED', 'LOST', 'ARCHIVED')),
  CONSTRAINT "event_enquiries_priority" CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'))
);

CREATE INDEX "event_enquiries_created_at_idx" ON "event_enquiries" ("created_at" DESC);
CREATE INDEX "event_enquiries_status_created_at_idx" ON "event_enquiries" ("status", "created_at" DESC);
CREATE INDEX "event_enquiries_category_created_at_idx" ON "event_enquiries" ("service_category", "created_at" DESC);

CREATE TABLE "enquiry_activity" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "enquiry_id" UUID NOT NULL,
  "previous_status" VARCHAR(20),
  "new_status" VARCHAR(20) NOT NULL,
  "changed_by" VARCHAR(320) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enquiry_activity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "enquiry_activity_previous_status" CHECK ("previous_status" IS NULL OR "previous_status" IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONFIRMED', 'LOST', 'ARCHIVED')),
  CONSTRAINT "enquiry_activity_new_status" CHECK ("new_status" IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONFIRMED', 'LOST', 'ARCHIVED')),
  CONSTRAINT "enquiry_activity_enquiry_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "event_enquiries"("id") ON DELETE CASCADE
);

CREATE INDEX "enquiry_activity_enquiry_created_idx" ON "enquiry_activity" ("enquiry_id", "created_at" DESC);

CREATE TABLE "admin_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "token_hash" VARCHAR(64) NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_sessions_token_hash_key" UNIQUE ("token_hash")
);

CREATE INDEX "admin_sessions_email_expiry_idx" ON "admin_sessions" ("email", "expires_at");
CREATE INDEX "admin_sessions_expiry_idx" ON "admin_sessions" ("expires_at");

CREATE TABLE "rate_limit_buckets" (
  "bucket_key" VARCHAR(100) NOT NULL,
  "window_started_at" TIMESTAMPTZ(6) NOT NULL,
  "request_count" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("bucket_key"),
  CONSTRAINT "rate_limit_buckets_request_count" CHECK ("request_count" > 0)
);

CREATE INDEX "rate_limit_buckets_window_idx" ON "rate_limit_buckets" ("window_started_at");

CREATE FUNCTION set_event_enquiry_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER event_enquiries_updated_at
BEFORE UPDATE ON event_enquiries
FOR EACH ROW EXECUTE FUNCTION set_event_enquiry_updated_at();
