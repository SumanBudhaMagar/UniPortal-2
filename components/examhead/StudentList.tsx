// components/examhead/StudentList.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface Student {
  user_id: string;
  name: string;
  email: string;
  student_id: string;
  department_id: string;
  current_semester: number;
}

interface StudentListProps {
  students: Student[];
  selectedStudent: Student | null;
  onStudentSelect: (student: Student) => void;
}

export default function StudentList({
  students,
  selectedStudent,
  onStudentSelect
}: StudentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Student ({students.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No students found in this semester.
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {students.map((student) => (
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
                  ID: {student.student_id}
                </div>
                <div className="text-xs text-gray-500">
                  {student.email}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}