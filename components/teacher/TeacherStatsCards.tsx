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
      <Card className="login text-black" >
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{courses.length}</div>
          <div className="">My Courses</div>
        </CardContent>
      </Card>
      
      <Card className="login text-black">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{students.length}</div>
          <div className="">Total Students</div>
        </CardContent>
      </Card>
      
      <Card className="text-black login">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{internalGrades.length}</div>
          <div className="">Grades Entered</div>
        </CardContent>
      </Card>
      
      <Card className="text-black login">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{avgPerformance}%</div>
          <div className="">Avg Performance</div>
        </CardContent>
      </Card>
    </div>
  );
}