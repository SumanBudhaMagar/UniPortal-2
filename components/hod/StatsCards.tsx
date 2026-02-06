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
      <Card className="login">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{students.length}</div>
          <div className="text-black">Total Students</div>
        </CardContent>
      </Card>
      
      <Card className="login">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{registeredStudents}</div>
          <div className="text-black">Registered Students</div>
        </CardContent>
      </Card>
      
      <Card className="login">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{teachers.length}</div>
          <div className="text-black">Teachers</div>
        </CardContent>
      </Card>
      
      <Card className="login">
        <CardContent className="pt-6">
          <div className="text-4xl font-bold">{courses.length}</div>
          <div className="text-black">Total Courses</div>
        </CardContent>
      </Card>
    </div>
  );
}

