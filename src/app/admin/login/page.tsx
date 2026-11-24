import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <main className="flex min-h-screen items-center justify-center px-5 py-16">
    <div className="w-full max-w-md bg-white px-6 py-9 shadow-[0_18px_70px_rgba(37,35,34,0.08)] sm:px-10 sm:py-11">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9B773F]">Private workspace</p>
      <h1 className="mt-4 font-heading text-3xl font-light tracking-tight text-[#252322]">Administrator sign in</h1>
      <p className="mt-3 text-sm leading-7 text-[#252322]/60">Sign in with an authorized team account.</p>
      <AdminLoginForm />
    </div>
  </main>;
}
