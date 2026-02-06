// ============================================
// FILE 10: components/teacher/TeacherProfile.tsx
// ============================================

import { Card, CardContent } from "@/components/ui/card";
import { Teacher } from './types';

interface TeacherProfileProps {
  teacher: Teacher;
}

export default function TeacherProfile({ teacher }: TeacherProfileProps) {
  return (
    <Card className="login text-black">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-3">{teacher.name}</h2>
            <div className="space-y-2 ">
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>{teacher.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🆔</span>
                <span>Teacher ID: {teacher.teacher_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏛️</span>
                <span>{teacher.department} ({teacher.department_code})</span>
              </div>
            </div>
          </div>
          <div className="text-8xl opacity-80">👨‍🏫</div>
        </div>
      </CardContent>
    </Card>
  );
}
