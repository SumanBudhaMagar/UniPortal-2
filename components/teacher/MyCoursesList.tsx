// FILE 4: components/teacher/MyCoursesList.tsx
// ============================================

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from './types';
import { getSemesterName } from './utils';

interface MyCoursesListProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

export default function MyCoursesList({ courses, onSelectCourse }: MyCoursesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📚 My Courses</CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No courses assigned yet. Contact your HOD.
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
                    Code: {course.course_code} | Credits: {course.credits} | {getSemesterName(course.semester)}
                  </div>
                </div>
                <Button
                  onClick={() => onSelectCourse(course)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Manage
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}