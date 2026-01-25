// FILE 8: components/teacher/CourseAnalytics.tsx
// ============================================

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { InternalGrade } from './types';
import { getGradeColor } from './utils';

interface CourseAnalyticsProps {
  internalGrades: InternalGrade[];
  courseName: string;
}

export default function CourseAnalytics({ 
  internalGrades, 
  courseName 
}: CourseAnalyticsProps) {
  if (internalGrades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Course Analytics - {courseName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No grades entered yet for this course
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgMarks = (
    internalGrades.reduce((sum, g) => sum + g.total_marks, 0) / internalGrades.length
  ).toFixed(2);

  const gradeDistribution: Record<string, number> = {};
  internalGrades.forEach(g => {
    gradeDistribution[g.grade_letter] = (gradeDistribution[g.grade_letter] || 0) + 1;
  });

  const highest = Math.max(...internalGrades.map(g => g.total_marks));
  const lowest = Math.min(...internalGrades.map(g => g.total_marks));

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Course Analytics - {courseName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Average Marks</div>
              <div className="text-2xl font-bold text-blue-700">{avgMarks}%</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Highest Score</div>
              <div className="text-2xl font-bold text-green-700">{highest}%</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600">Lowest Score</div>
              <div className="text-2xl font-bold text-red-700">{lowest}%</div>
            </div>
          </div>

          {/* Grade Distribution */}
          <div>
            <h3 className="font-semibold mb-3">Grade Distribution</h3>
            <div className="space-y-2">
              {Object.entries(gradeDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([grade, count]) => (
                  <div key={grade} className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded font-bold min-w-[50px] text-center ${getGradeColor(grade)}`}>
                      {grade}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ width: `${(count / internalGrades.length) * 100}%` }}
                      >
                        {count}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 min-w-[60px] text-right">
                      {((count / internalGrades.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Grades */}
          <div>
            <h3 className="font-semibold mb-3">All Student Grades</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {internalGrades
                .sort((a, b) => b.total_marks - a.total_marks)
                .map((grade) => (
                  <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{grade.student_name}</div>
                      <div className="text-sm text-gray-600">{grade.student_id}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold">{grade.total_marks}%</div>
                      <div className={`px-3 py-1 rounded font-bold ${getGradeColor(grade.grade_letter)}`}>
                        {grade.grade_letter}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

