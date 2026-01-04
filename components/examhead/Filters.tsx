// components/examhead/Filters.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface FiltersProps {
  departments: Department[];
  selectedDepartment: string;
  selectedSemester: string;
  onDepartmentChange: (deptId: string) => void;
  onSemesterChange: (semester: string) => void;
  getSemesterName: (semester: number) => string;
}

export default function Filters({
  departments,
  selectedDepartment,
  selectedSemester,
  onDepartmentChange,
  onSemesterChange,
  getSemesterName
}: FiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Department & Semester</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Department</Label>
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Semester</Label>
            <select
              value={selectedSemester}
              onChange={(e) => onSemesterChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={!selectedDepartment}
            >
              {[...Array(8)].map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {getSemesterName(idx + 1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}