// ============================================
// FILE 3: components/teacher/TeacherStatsCards.tsx
// ============================================

import { Card, CardContent } from "@/components/ui/card";
import { Course, Student, InternalGrade } from './types';

interface TeacherStatsCardsProps {
  courses: Course[];
  students: Student[];
  internalGrades: InternalGrade[];
}

export default function TeacherStatsCards({ 
  courses, 
  students, 
  internalGrades 
}: TeacherStatsCardsProps) {
  const avgPerformance = internalGrades.length > 0
    ? (internalGrades.reduce((sum, g) => sum + g.total_marks, 0) / internalGrades.length).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{courses.length}</div>
          <div className="text-blue-100">My Courses</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{students.length}</div>
          <div className="text-green-100">Total Students</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{internalGrades.length}</div>
          <div className="text-purple-100">Grades Entered</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{avgPerformance}%</div>
          <div className="text-orange-100">Avg Performance</div>
        </CardContent>
      </Card>
    </div>
  );
}