// ============================================
// FILE 4: components/student/StudentStatsCards.tsx
// ============================================

import { Card, CardContent } from "@/components/ui/card";
import { Course, Grade } from './types';

interface StudentStatsCardsProps {
  currentCourses: Course[];
  allGrades: Grade[];
  failedSubjects: Grade[];
}

export default function StudentStatsCards({ 
  currentCourses, 
  allGrades, 
  failedSubjects 
}: StudentStatsCardsProps) {
  const passedCourses = allGrades.filter(g => g.status === 'passed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{currentCourses.length}</div>
          <div className="text-blue-100">Current Courses</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{passedCourses}</div>
          <div className="text-green-100">Courses Passed</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{failedSubjects.length}</div>
          <div className="text-red-100">Subjects to Retake</div>
        </CardContent>
      </Card>
    </div>
  );
}