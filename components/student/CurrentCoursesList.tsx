// ============================================
// FILE 5: components/student/CurrentCoursesList.tsx
// ============================================

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Course } from './types';
import { getSemesterName } from './utils';

interface CurrentCoursesListProps {
  courses: Course[];
  currentSemester: number;
}

export default function CurrentCoursesList({ 
  courses, 
  currentSemester 
}: CurrentCoursesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          📚 Current Semester Courses ({getSemesterName(currentSemester)})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No courses assigned for this semester yet. Contact your HOD.
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex-1">
                  <div className="font-semibold text-lg">{course.course_name}</div>
                  <div className="text-sm text-gray-600">
                    Code: {course.course_code} | Credits: {course.credits} | Teacher: {course.teacher_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
