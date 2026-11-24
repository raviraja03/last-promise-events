import { z } from "zod";
import { createAdminSession, clearAdminSession, verifyAdminPassword, adminEmailIsAuthorized } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/enquiries/rate-limit";
import { getRequestIpHash, readBoundedRequestBody, requestHasSameOrigin } from "@/lib/enquiries/security";

const credentialsSchema = z.strictObject({ email: z.string().trim().email().max(320), password: z.string().min(1).max(256) });

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
  const body = await readBoundedRequestBody(request, 4_000).catch(() => null);
  if (!body || body.kind !== "ok") return Response.json({ error: "Enter a valid email and password." }, { status: body?.kind === "too-large" ? 413 : 400 });
  let raw: unknown;
  try { raw = JSON.parse(body.text); } catch { return Response.json({ error: "Enter a valid email and password." }, { status: 400 }); }
  const credentials = credentialsSchema.safeParse(raw);
  if (!credentials.success) return Response.json({ error: "Enter a valid email and password." }, { status: 422 });
  const email = credentials.data.email.toLowerCase();
  const secret = process.env.RATE_LIMIT_HASH_SECRET;
  if (!getPrisma() || !secret || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_SESSION_SECRET) return Response.json({ error: "Admin sign-in is not configured." }, { status: 503 });
  try {
    if (!await consumeRateLimit(`admin-login:${getRequestIpHash(request, secret)}`, 8, 900)) return Response.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
    const valid = adminEmailIsAuthorized(email) && await verifyAdminPassword(credentials.data.password);
    if (!valid) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
    await createAdminSession(email);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_sign_in_failed", code: error instanceof Error ? error.name : "unknown" }));
    return Response.json({ error: "Admin sign-in is temporarily unavailable." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!requestHasSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
  try { await clearAdminSession(); } catch (error) {
    console.error(JSON.stringify({ event: "admin_sign_out_failed", code: error instanceof Error ? error.name : "unknown" }));
    return Response.json({ error: "Sign out could not be completed." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
