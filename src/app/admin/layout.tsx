import type { Metadata } from "next";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: { default: "Admin | Last Promise Events", template: "%s | Admin | Last Promise Events" },
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return <div className="min-h-screen bg-[#F8F5EF]">{children}</div>;
}
