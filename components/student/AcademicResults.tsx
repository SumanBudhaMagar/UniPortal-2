// ============================================
// FILE 7: components/student/AcademicResults.tsx
// ============================================

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Grade } from './types';
import { getSemesterName, getGradeColor } from './utils';

interface AcademicResultsProps {
  grades: Grade[];
}

export default function AcademicResults({ grades }: AcademicResultsProps) {
  const uniqueSemesters = [...new Set(grades.map(g => g.semester))].sort((a, b) => b - a);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Academic Results</CardTitle>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No results published yet.
          </div>
        ) : (
          <div className="space-y-6">
            {uniqueSemesters.map(semester => (
              <div key={semester} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  {getSemesterName(semester)}
                </h3>
                <div className="space-y-2">
                  {grades
                    .filter(g => g.semester === semester)
                    .map((grade) => (
                      <div 
                        key={grade.id} 
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
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
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-lg font-bold ${getGradeColor(grade.grade_letter)}`}>
                            {grade.grade_letter}
                          </div>
                          <div className="text-gray-600">
                            GPA: {parseFloat(grade.gpa.toString()).toFixed(2)}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            grade.status === 'passed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {grade.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

