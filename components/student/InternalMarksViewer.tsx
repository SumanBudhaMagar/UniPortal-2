
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';

interface InternalGrade {
  id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  attendance: number;
  internal: number;
  class_performance: number;
  presentation: number;
  mini_project: number;
  assignment: number;
  total_marks: number;
  grade_letter: string;
  remarks?: string;
}

interface InternalMarksViewerProps {
  studentUserId: string;
  currentCourses: any[];
}

export default function InternalMarksViewer({ studentUserId, currentCourses }: InternalMarksViewerProps) {
  const [internalGrades, setInternalGrades] = useState<InternalGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  useEffect(() => {
    loadInternalMarks();
  }, [studentUserId]);

  const loadInternalMarks = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('internal_grades')
      .select('*')
      .eq('student_user_id', studentUserId);

    if (data) {
      setInternalGrades(data);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Loading internal marks...
        </CardContent>
      </Card>
    );
  }

  const filteredGrades = selectedCourse && selectedCourse !== ''
    ? internalGrades.filter(g => g.course_id === selectedCourse)
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>📝 Internal Assessment Marks</CardTitle>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white text-sm font-medium"
          >
            <option value="">Select a Course</option>
            {[...new Map(internalGrades.map(grade => [grade.course_id, grade])).values()].map(grade => (
              <option key={grade.course_id} value={grade.course_id}>
                {grade.course_code} - {grade.course_name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {internalGrades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No internal assessment marks published yet.
          </div>
        ) : !selectedCourse ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg mb-2">Please select a course to view internal marks</div>
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No marks found for selected course.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGrades.map((grade) => (
              <div key={grade.id} className="border rounded-lg overflow-hidden">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">{grade.course_code}</div>
                      <div className="text-sm opacity-90">{grade.course_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Total Marks</div>
                      <div className="text-3xl font-bold">{grade.total_marks}</div>
                    </div>
                  </div>
                </div>

                {/* Marks Breakdown */}
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {grade.attendance > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Attendance</div>
                        <div className="text-2xl font-bold text-blue-700">{grade.attendance}</div>
                      </div>
                    )}
                    {grade.internal > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Internal Exam</div>
                        <div className="text-2xl font-bold text-green-700">{grade.internal}</div>
                      </div>
                    )}
                    {grade.class_performance > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Class Performance</div>
                        <div className="text-2xl font-bold text-yellow-700">{grade.class_performance}</div>
                      </div>
                    )}
                    {grade.presentation > 0 && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Presentation</div>
                        <div className="text-2xl font-bold text-purple-700">{grade.presentation}</div>
                      </div>
                    )}
                    {grade.mini_project > 0 && (
                      <div className="p-3 bg-pink-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Mini Project</div>
                        <div className="text-2xl font-bold text-pink-700">{grade.mini_project}</div>
                      </div>
                    )}
                    {grade.assignment > 0 && (
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Assignment</div>
                        <div className="text-2xl font-bold text-indigo-700">{grade.assignment}</div>
                      </div>
                    )}
                  </div>

                  {/* Grade Summary */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-600">Internal Grade</div>
                        <div className="text-3xl font-bold text-purple-700">{grade.grade_letter}</div>
                      </div>
                      {grade.remarks && (
                        <div className="text-sm text-gray-600 italic max-w-md">
                          {grade.remarks}
                        </div>
                      )}
                    </div>
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