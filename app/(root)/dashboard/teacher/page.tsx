"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const userRole = session.user?.user_metadata?.role;
      
      if (userRole !== "teacher") {
        router.push("/dashboard/student");
        return;
      }

      setUser(session.user);
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      <p className="mt-2">Welcome, {user?.user_metadata?.name || user?.email}</p>
    </div>
  );
}