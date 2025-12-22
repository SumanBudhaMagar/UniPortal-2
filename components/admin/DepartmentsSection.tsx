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
  has_hod?: boolean;
}

interface DepartmentsSectionProps {
  departments: Department[];
  onAddDepartment: (data: { name: string; code: string }) => Promise<void>;
  onDeleteDepartment: (id: string) => Promise<void>;
}

/* ---------- Component ---------- */
export default function DepartmentsSection({
  departments,
  onAddDepartment,
  onDeleteDepartment,
}: DepartmentsSectionProps) {
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await onAddDepartment(newDept);
    setNewDept({ name: "", code: "" });
    setShowAddDept(false);
    setLoading(false);
  };

  return (
    <Card>
      {/* Header */}
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>🏢 Departments</CardTitle>
        <Button
          onClick={() => setShowAddDept(!showAddDept)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Department
        </Button>
      </CardHeader>

      <CardContent>
        {/* Add Department Form */}
        {showAddDept && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department Name</Label>
                <Input
                  value={newDept.name}
                  onChange={(e) =>
                    setNewDept({ ...newDept, name: e.target.value })
                  }
                  placeholder="Computer Science"
                  required
                />
              </div>

              <div>
                <Label>Department Code</Label>
                <Input
                  value={newDept.code}
                  onChange={(e) =>
                    setNewDept({ ...newDept, code: e.target.value })
                  }
                  placeholder="CS"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Department"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddDept(false)}
                className="bg-gray-400"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Department List */}
        <div className="space-y-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {dept.name}
                  {dept.has_hod ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      ✓ Has HOD
                    </span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      ⚠ No HOD
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Code: {dept.code}
                </div>
              </div>

              <Button
                onClick={() => onDeleteDepartment(dept.id)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          ))}

          {departments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No departments found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
