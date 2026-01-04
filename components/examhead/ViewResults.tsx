// components/examhead/ViewResults.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Department {
  id: string;
  name: string;
}

interface ViewResultsProps {
  allGrades: any[];
  departments: Department[];
  filterDept: string;
  filterSemester: string;
  searchQuery: string;
  onFilterDeptChange: (deptId: string) => void;
  onFilterSemesterChange: (semester: string) => void;
  onSearchChange: (query: string) => void;
  getSemesterName: (semester: number) => string;
}

export default function ViewResults({
  allGrades,
  departments,
  filterDept,
  filterSemester,
  searchQuery,
  onFilterDeptChange,
  onFilterSemesterChange,
  onSearchChange,
  getSemesterName
}: ViewResultsProps) {
  const filteredGrades = allGrades.filter(grade => {
    const matchesDept = !filterDept || grade.authorized_students?.departments?.id === filterDept;
    const matchesSem = !filterSemester || grade.semester === parseInt(filterSemester);
    const matchesSearch = !searchQuery || 
      grade.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.course_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDept && matchesSem && matchesSearch;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Department</Label>
              <select
                value={filterDept}
                onChange={(e) => onFilterDeptChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Departments</option>
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
                value={filterSemester}
                onChange={(e) => onFilterSemesterChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Semesters</option>
                {[...Array(8)].map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {getSemesterName(idx + 1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by name, ID, or course..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Published Results ({filteredGrades.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGrades.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No results found matching your filters.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-100 rounded-lg font-semibold sticky top-0">
                <div className="col-span-2">Student</div>
                <div className="col-span-2">Student ID</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Course</div>
                <div className="col-span-1">Semester</div>
                <div className="col-span-1">Grade</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1">Status</div>
              </div>
              {filteredGrades.map((grade) => (
                <div key={grade.id} className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg items-center text-sm">
                  <div className="col-span-2">{grade.student_name}</div>
                  <div className="col-span-2 text-gray-600">{grade.student_id}</div>
                  <div className="col-span-2 text-gray-600">{grade.authorized_students?.departments?.name}</div>
                  <div className="col-span-2">{grade.course_code}</div>
                  <div className="col-span-1">{grade.semester}</div>
                  <div className="col-span-1">
                    <span className="font-bold">{grade.grade_letter}</span> ({grade.gpa})
                  </div>
                  <div className="col-span-1">
                    {grade.exam_type === 'retake' ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Retake</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Regular</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      grade.status === 'passed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {grade.status === 'passed' ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}