import AdminNavigation from "@/components/admin/AdminNavigation";
import AdminEnquiryDetail from "@/components/admin/AdminEnquiryDetail";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function AdminEnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { id }] = await Promise.all([requireAdminPage(), params]);
  return <>
    <AdminNavigation email={user.email} />
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><AdminEnquiryDetail id={id} /></main>
  </>;
}
