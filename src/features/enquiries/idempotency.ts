import { createHmac } from "node:crypto";

export function hashEnquiryIdempotencyKey(key: string, secret: string) {
  return createHmac("sha256", secret).update(`enquiry:${key}`).digest("hex");
}

export function hashClientIp(ip: string, secret: string) {
  return createHmac("sha256", secret).update(ip).digest("hex");
}
