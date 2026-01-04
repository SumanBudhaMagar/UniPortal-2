// ============================================
// FILE 3: components/student/StudentProfileCard.tsx
// ============================================

import { Card, CardContent } from "@/components/ui/card";
import { Student } from './types';
import { getSemesterName } from './utils';

interface StudentProfileCardProps {
  student: Student;
  cgpa: number;
}

export default function StudentProfileCard({ student, cgpa }: StudentProfileCardProps) {
  return (
    <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-purple-100">Student ID</div>
            <div className="text-xl font-bold">{student.student_id}</div>
          </div>
          <div>
            <div className="text-sm text-purple-100">Department</div>
            <div className="text-xl font-bold">{student.department}</div>
          </div>
          <div>
            <div className="text-sm text-purple-100">Current Semester</div>
            <div className="text-xl font-bold">
              {getSemesterName(student.current_semester)}
            </div>
          </div>
          <div>
            <div className="text-sm text-purple-100">CGPA</div>
            <div className="text-xl font-bold">{cgpa.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
