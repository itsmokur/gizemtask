"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Protect all dashboard routes — redirect to login if not authenticated
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  // If auth takes too long (e.g. Firebase not reachable), redirect to login
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (timedOut && !user) {
      router.replace("/login");
    }
  }, [user, loading, router, timedOut]);

  if (loading && !timedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
