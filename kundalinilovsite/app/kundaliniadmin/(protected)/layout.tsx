import { redirect } from "next/navigation";
import { AdminApiError, fetchMe } from "@/lib/admin-api";

export const instant = false;

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await fetchMe();
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      redirect("/kundaliniadmin/login");
    }
    throw error;
  }

  return children;
}
