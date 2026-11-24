import "server-only";
import { getPrisma } from "@/lib/prisma";

export async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database unavailable");
  const rows = await prisma.$queryRaw<Array<{ allowed: boolean }>>`
    INSERT INTO rate_limit_buckets (bucket_key, window_started_at, request_count)
    VALUES (${key}, now(), 1)
    ON CONFLICT (bucket_key) DO UPDATE SET
      window_started_at = CASE WHEN rate_limit_buckets.window_started_at <= now() - (${windowSeconds} * interval '1 second') THEN now() ELSE rate_limit_buckets.window_started_at END,
      request_count = CASE WHEN rate_limit_buckets.window_started_at <= now() - (${windowSeconds} * interval '1 second') THEN 1 ELSE rate_limit_buckets.request_count + 1 END
    RETURNING (request_count <= ${limit}) AS allowed`;
  return rows[0]?.allowed === true;
}
