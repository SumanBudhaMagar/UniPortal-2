'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ---------- Types ---------- */
export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface HOD {
  id: string;
  email: string;
  name: string;
  department_id: string;
  departments?: {
    name: string;
    code: string;
  };
}

interface HODSectionProps {
  hods: HOD[];
  departmentsWithoutHOD: Department[];
  onAddHOD: (data: {
    name: string;
    email: string;
    departmentId: string;
  }) => Promise<void>;
  onDeleteHOD: (id: string) => Promise<void>;
}

/* ---------- Component ---------- */
export default function HODSection({
  hods,
  departmentsWithoutHOD,
  onAddHOD,
  onDeleteHOD,
}: HODSectionProps) {
  const [showAddHOD, setShowAddHOD] = useState(false);
  const [newHOD, setNewHOD] = useState({
    name: "",
    email: "",
    departmentId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await onAddHOD(newHOD);
    setNewHOD({ name: "", email: "", departmentId: "" });
    setShowAddHOD(false);
    setLoading(false);
  };

  return (
    <Card>
      {/* Header */}
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>👥 HODs (Heads of Department)</CardTitle>
        <Button
          onClick={() => setShowAddHOD(!showAddHOD)}
          className="bg-green-600 hover:bg-green-700"
          disabled={departmentsWithoutHOD.length === 0}
        >
          + Authorize New HOD
        </Button>
      </CardHeader>

      <CardContent>
        {/* Info message */}
        {departmentsWithoutHOD.length === 0 && !showAddHOD && (
          <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            ℹ️ All departments already have HODs assigned.
            Remove an existing HOD to add a new one.
          </div>
        )}

        {/* Add HOD Form */}
        {showAddHOD && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-green-50 rounded-lg space-y-4"
          >
            <div className="space-y-4">
              <div>
                <Label>HOD Name</Label>
                <Input
                  value={newHOD.name}
                  onChange={(e) =>
                    setNewHOD({ ...newHOD, name: e.target.value })
                  }
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              <div>
                <Label>HOD Email (KU Email)</Label>
                <Input
                  type="email"
                  value={newHOD.email}
                  onChange={(e) =>
                    setNewHOD({ ...newHOD, email: e.target.value })
                  }
                  placeholder="hod.cs@ku.edu.np"
                  required
                />
              </div>

              <div>
                <Label>
                  Department (Only departments without HOD shown)
                </Label>
                <select
                  value={newHOD.departmentId}
                  onChange={(e) =>
                    setNewHOD({
                      ...newHOD,
                      departmentId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Department</option>
                  {departmentsWithoutHOD.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>

                {departmentsWithoutHOD.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    No departments available.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={loading || departmentsWithoutHOD.length === 0}
              >
                {loading ? "Authorizing..." : "Authorize HOD"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddHOD(false)}
                className="bg-gray-400"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* HOD List */}
        <div className="space-y-3">
          {hods.map((hod) => (
            <div
              key={hod.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div>
                <div className="font-semibold">{hod.name}</div>
                <div className="text-sm text-gray-600">{hod.email}</div>
                <div className="text-sm text-blue-600">
                  HOD of {hod.departments?.name} ({hod.departments?.code})
                </div>
              </div>

              <Button
                onClick={() => onDeleteHOD(hod.id)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Remove
              </Button>
            </div>
          ))}

          {hods.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No HODs authorized yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
