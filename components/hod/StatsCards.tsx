// ============================================
// FILE 3: components/hod/StatsCards.tsx
// ============================================

import { Card, CardContent } from "@/components/ui/card";
import { Student, Teacher, Course } from './types';

interface StatsCardsProps {
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
}

export default function StatsCards({ students, teachers, courses }: StatsCardsProps) {
  const registeredStudents = students.filter(s => s.status === 'registered').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{students.length}</div>
          <div className="text-blue-100">Total Students</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{registeredStudents}</div>
          <div className="text-green-100">Registered Students</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{teachers.length}</div>
          <div className="text-orange-100">Teachers</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{courses.length}</div>
          <div className="text-purple-100">Total Courses</div>
        </CardContent>
      </Card>
    </div>
  );
}

