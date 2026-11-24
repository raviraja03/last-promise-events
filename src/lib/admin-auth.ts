import "server-only";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const COOKIE = "lpe_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const COOKIE_OPTIONS = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: SESSION_SECONDS };

function digest(token: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin session configuration is unavailable.");
  return createHmac("sha256", secret).update(token).digest("hex");
}

export async function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [algorithm, salt, encoded] = expected.split("$");
  if (algorithm !== "scrypt" || !salt || !encoded) return false;
  try {
    const expectedBuffer = Buffer.from(encoded, "base64url");
    const actual = await scrypt(password, Buffer.from(salt, "base64url"), expectedBuffer.length) as Buffer;
    return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
  } catch { return false; }
}

export async function createAdminSession(email: string) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is unavailable.");
  const token = randomBytes(32).toString("base64url");
  await prisma.adminSession.create({ data: { tokenHash: digest(token), email, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) } });
  (await cookies()).set(COOKIE, token, COOKIE_OPTIONS);
}

export async function clearAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const prisma = getPrisma();
    if (prisma) await prisma.adminSession.updateMany({ where: { tokenHash: digest(token), revokedAt: null }, data: { revokedAt: new Date() } });
  }
  jar.set(COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export async function getAdminSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const session = await prisma.adminSession.findFirst({ where: { tokenHash: digest(token), revokedAt: null, expiresAt: { gt: new Date() } }, select: { email: true } });
    return session;
  } catch { return null; }
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function adminEmailIsAuthorized(email: string) {
  return Boolean(process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase());
}
