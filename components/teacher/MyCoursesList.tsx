// ============================================
// FILE: components/teacher/MyCoursesList.tsx (Updated)
// ============================================

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Course } from './types';
import { getSemesterName } from './utils';

interface MyCoursesListProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onUpdateMarksBreakdown?: (
    courseId: string,
    breakdown: {
      attendance: number;
      internal: number;
      class_performance: number;
      presentation: number;
      mini_project: number;
      assignment: number;
    }
  ) => Promise<void>;
}

export default function MyCoursesList({ courses, onSelectCourse, onUpdateMarksBreakdown }: MyCoursesListProps) {
  const [expandedCourseId, setExpandedCourseId] = useState<string>('');
  const [savingCourseId, setSavingCourseId] = useState<string>('');
  const [marksBreakdown, setMarksBreakdown] = useState<Record<string, {
    attendance: number;
    internal: number;
    class_performance: number;
    presentation: number;
    mini_project: number;
    assignment: number;
  }>>({});

  const toggleExpand = (courseId: string, course: Course) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId('');
    } else {
      setExpandedCourseId(courseId);
      // Initialize with existing values or defaults
      setMarksBreakdown(prev => ({
        ...prev,
        [courseId]: {
          attendance: course.teacher_marks_breakdown?.attendance ?? 5,
          internal: course.teacher_marks_breakdown?.internal ?? 15,
          class_performance: course.teacher_marks_breakdown?.class_performance ?? 0,
          presentation: course.teacher_marks_breakdown?.presentation ?? 0,
          mini_project: course.teacher_marks_breakdown?.mini_project ?? 0,
          assignment: course.teacher_marks_breakdown?.assignment ?? 5,
        }
      }));
    }
  };

  const handleSaveBreakdown = async (course: Course) => {
    const breakdown = marksBreakdown[course.id];
    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    const expectedTotal = course.teacher_marks_total ?? 25;

    if (total !== expectedTotal) {
      alert(`Total must equal ${expectedTotal}. Current total: ${total}`);
      return;
    }

    if (onUpdateMarksBreakdown) {
      setSavingCourseId(course.id);
      await onUpdateMarksBreakdown(course.id, breakdown);
      setSavingCourseId('');
      setExpandedCourseId('');
    }
  };

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
            {courses.map((course) => {
              const teacherTotal = course.teacher_marks_total ?? 25;
              const examTotal = course.exam_marks_total ?? 75;
              const currentBreakdown = marksBreakdown[course.id];
              const breakdownSum = currentBreakdown 
                ? Object.values(currentBreakdown).reduce((sum, val) => sum + val, 0)
                : 0;
              const hasBreakdown = course.teacher_marks_breakdown && 
                Object.keys(course.teacher_marks_breakdown).length > 0;

              return (
                <div 
                  key={course.id} 
                  className="bg-gray-50 rounded-lg hover:bg-gray-100 overflow-hidden"
                >
                  <div className="flex justify-between items-center p-4">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{course.course_name}</div>
                      <div className="text-sm text-gray-600">
                        Code: {course.course_code} | Credits: {course.credits} | {getSemesterName(course.semester)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Scheme: {examTotal} (Exam) / {teacherTotal} (Teacher)
                        {!hasBreakdown && (
                          <span className="ml-2 text-orange-600 font-semibold">
                            ⚠ Marks breakdown not configured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleExpand(course.id, course)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {expandedCourseId === course.id ? 'Close' : 'Configure Marks'}
                      </Button>
                      <Button
                        onClick={() => onSelectCourse(course)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Manage Students
                      </Button>
                    </div>
                  </div>

                  {/* Marks Breakdown Configuration */}
                  {expandedCourseId === course.id && currentBreakdown && (
                    <div className="p-4 bg-white border-t space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-base">Configure Your {teacherTotal} Marks Distribution</h4>
                        <p className="text-sm text-gray-600">
                          Allocate your {teacherTotal} marks across different components. The total must equal {teacherTotal}.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {([
                          ['attendance', 'Attendance'],
                          ['internal', 'Internal Exams (1+2)'],
                          ['class_performance', 'Class Performance'],
                          ['presentation', 'Presentation'],
                          ['mini_project', 'Mini Project'],
                          ['assignment', 'Assignments'],
                        ] as const).map(([key, label, icon]) => (
                          <div key={key}>
                            <Label className="text-sm font-medium">
                              {icon} {label}
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              max={teacherTotal}
                              value={currentBreakdown[key]}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(teacherTotal, Number(e.target.value)));
                                setMarksBreakdown(prev => ({
                                  ...prev,
                                  [course.id]: {
                                    ...currentBreakdown,
                                    [key]: val
                                  }
                                }));
                              }}
                              className="mt-1"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className={`font-semibold ${
                          breakdownSum === teacherTotal 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          Total: {breakdownSum} / {teacherTotal} marks
                          {breakdownSum === teacherTotal && ' ✓'}
                          {breakdownSum !== teacherTotal && ' ⚠ Must equal ' + teacherTotal}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setExpandedCourseId('')}
                            className="bg-gray-400"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleSaveBreakdown(course)}
                            disabled={savingCourseId === course.id || breakdownSum !== teacherTotal}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {savingCourseId === course.id ? 'Saving...' : 'Save Configuration'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}