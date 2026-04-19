"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * Portal layout — wraps every admin page UNDER /admin/(portal)/.
 * Login page (/admin) sits OUTSIDE this group so it renders without
 * the sidebar.
 *
 * Auth is checked here once for the whole portal so individual pages
 * don't have to re-implement the check.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-gray-500 text-sm">
        Loading admin portal…
      </div>
    );
  }
  if (authed === false) {
    if (typeof window !== "undefined") router.replace("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
