// ============================================
// FILE 6: components/student/FailedSubjectsList.tsx
// ============================================

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Grade } from './types';
import { getSemesterName } from './utils';

interface FailedSubjectsListProps {
  failedSubjects: Grade[];
}

export default function FailedSubjectsList({ failedSubjects }: FailedSubjectsListProps) {
  if (failedSubjects.length === 0) return null;

  return (
    <Card className="border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-red-700">⚠️ Subjects to Retake</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {failedSubjects.map((subject) => (
            <div 
              key={subject.id} 
              className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200"
            >
              <div className="flex-1">
                <div className="font-semibold">{subject.course_name}</div>
                <div className="text-sm text-gray-600">
                  Code: {subject.course_code} | Semester: {getSemesterName(subject.semester)} | Grade: {subject.grade_letter}
                </div>
              </div>
              <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                Failed
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
