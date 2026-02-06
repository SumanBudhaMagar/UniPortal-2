'use client';

import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  admin: {
    name: string;
    email?: string;
  } | null;
  onLogout: () => void;
}

export default function AdminHeader({ admin, onLogout }: AdminHeaderProps) {
  return (
    <div className="yellow_container text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-end justify-end">
        <div>
          <h1 className="heading relative right-[-110px]">Admin Dashboard</h1>
          <p className="sub-heading relative right-[-100px]">
            Welcome, {admin?.name ?? "Admin"}
          </p>
        </div>

        <Button
          onClick={onLogout}
          className="tag bg-slate-100 text-black hover:bg-slate-200"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
