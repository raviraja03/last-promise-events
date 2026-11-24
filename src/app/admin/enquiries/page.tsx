import AdminNavigation from "@/components/admin/AdminNavigation";
import AdminEnquiryList from "@/components/admin/AdminEnquiryList";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function AdminEnquiriesPage() {
  const user = await requireAdminPage();
  return <>
    <AdminNavigation email={user.email} />
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <div className="mb-8"><p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9B773F]">Lead management</p><h1 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#252322] sm:text-4xl">All enquiries</h1></div>
      <div className="bg-white p-4 sm:p-7"><AdminEnquiryList /></div>
    </main>
  </>;
}
