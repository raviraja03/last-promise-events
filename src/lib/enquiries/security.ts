import "server-only";
import { hashClientIp, hashEnquiryIdempotencyKey } from "@/features/enquiries/idempotency";

export const MAX_ENQUIRY_BODY_BYTES = 20_000;

export async function readBoundedRequestBody(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) return { kind: "empty" as const };
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > limit) {
      await reader.cancel();
      return { kind: "too-large" as const };
    }
    chunks.push(value);
  }
  return { kind: "ok" as const, text: Buffer.concat(chunks).toString("utf8") };
}

export function requestHasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
      : new URL(request.url).origin;
    return new URL(origin).origin === expectedOrigin;
  } catch {
    return false;
  }
}

export function getRequestIpHash(request: Request, secret: string) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return hashClientIp(ip, secret);
}

export function getIdempotencyHash(key: string, secret: string) {
  return hashEnquiryIdempotencyKey(key, secret);
}
