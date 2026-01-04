// components/examhead/StudentRecords.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Student {
  user_id: string;
  name: string;
  email: string;
  student_id: string;
  current_semester: number;
  departments?: {
    name: string;
    code: string;
  };
}

interface Grade {
  id: string;
  course_name: string;
  course_code: string;
  semester: number;
  grade_letter: string;
  gpa: number;
  status: string;
  exam_type: string;
}

interface StudentRecordsProps {
  allStudents: Student[];
  selectedStudent: Student | null;
  studentGrades: Grade[];
  studentSearchQuery: string;
  onSearchChange: (query: string) => void;
  onStudentSelect: (student: Student) => void;
  getSemesterName: (semester: number) => string;
}

export default function StudentRecords({
  allStudents,
  selectedStudent,
  studentGrades,
  studentSearchQuery,
  onSearchChange,
  onStudentSelect,
  getSemesterName
}: StudentRecordsProps) {
  const filteredStudents = allStudents.filter(student => {
    return student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
           student.email.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
           student.student_id.toLowerCase().includes(studentSearchQuery.toLowerCase());
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Search Student</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, email, or student ID..."
            value={studentSearchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>All Students ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.user_id}
                  onClick={() => onStudentSelect(student)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedStudent?.user_id === student.user_id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-sm text-gray-600">
                    ID: {student.student_id} | {student.departments?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Current: {getSemesterName(student.current_semester)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStudent ? `${selectedStudent.name}'s Records` : 'Select a Student'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <>
                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Student ID:</strong> {selectedStudent.student_id}</div>
                    <div><strong>Email:</strong> {selectedStudent.email}</div>
                    <div><strong>Department:</strong> {selectedStudent.departments?.name}</div>
                    <div><strong>Current Semester:</strong> {getSemesterName(selectedStudent.current_semester)}</div>
                  </div>
                </div>

                {studentGrades.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No grades recorded yet for this student.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...new Set(studentGrades.map(g => g.semester))].sort().map(semester => (
                      <div key={semester}>
                        <h3 className="font-semibold text-lg mb-2">
                          {getSemesterName(semester)}
                        </h3>
                        <div className="space-y-2">
                          {studentGrades.filter(g => g.semester === semester).map((grade) => (
                            <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-semibold">{grade.course_name}</div>
                                <div className="text-sm text-gray-600">
                                  {grade.course_code}
                                  {grade.exam_type === 'retake' && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      Retake
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-lg font-bold">{grade.grade_letter}</div>
                                <div className="text-sm text-gray-600">({parseFloat(grade.gpa.toString()).toFixed(2)})</div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  grade.status === 'passed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {grade.status === 'passed' ? '✓' : '✗'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a student from the list to view their complete exam records.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}