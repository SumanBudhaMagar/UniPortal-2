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
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100">
            Welcome, {admin?.name ?? "Admin"}
          </p>
        </div>

        <Button
          onClick={onLogout}
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
