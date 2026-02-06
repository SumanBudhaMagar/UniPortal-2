// ============================================
// FILE 1: components/student/AttendanceTracker.tsx
// ============================================
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';

interface AttendanceRecord {
  id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface CourseAttendance {
  course_id: string;
  course_code: string;
  course_name: string;
  total_classes: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

interface AttendanceTrackerProps {
  studentUserId: string;
  currentCourses: any[];
}

export default function AttendanceTracker({ studentUserId, currentCourses }: AttendanceTrackerProps) {
  const [attendanceData, setAttendanceData] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [detailedRecords, setDetailedRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadAttendance();
  }, [studentUserId]);

  useEffect(() => {
    if (selectedCourse && selectedCourse !== 'all') {
      loadDetailedRecords(selectedCourse);
    }
  }, [selectedCourse]);

  const loadAttendance = async () => {
    setLoading(true);
    
    const { data: attendanceRecords } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_user_id', studentUserId);

    if (attendanceRecords) {
      // Group by course
      const courseMap = new Map<string, CourseAttendance>();

      currentCourses.forEach(course => {
        const courseRecords = attendanceRecords.filter(r => r.course_id === course.id);
        const total = courseRecords.length;
        const present = courseRecords.filter(r => r.status === 'present').length;
        const absent = courseRecords.filter(r => r.status === 'absent').length;
        const late = courseRecords.filter(r => r.status === 'late').length;

        courseMap.set(course.id, {
          course_id: course.id,
          course_code: course.course_code,
          course_name: course.course_name,
          total_classes: total,
          present,
          absent,
          late,
          percentage: total > 0 ? ((present + late) / total) * 100 : 0
        });
      });

      setAttendanceData(Array.from(courseMap.values()));
    }
    
    setLoading(false);
  };

  const loadDetailedRecords = async (courseId: string) => {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_user_id', studentUserId)
      .eq('course_id', courseId)
      .order('date', { ascending: false });

    if (data) setDetailedRecords(data);
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-100 text-green-700 border-green-300';
    if (percentage >= 65) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-700',
      absent: 'bg-red-100 text-red-700',
      late: 'bg-yellow-100 text-yellow-700'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Loading attendance...
        </CardContent>
      </Card>
    );
  }

  const overallPercentage = attendanceData.length > 0
    ? attendanceData.reduce((sum, c) => sum + c.percentage, 0) / attendanceData.length
    : 0;

  const filteredData = selectedCourse && selectedCourse !== '' 
    ? attendanceData.filter(c => c.course_id === selectedCourse)
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>📅 Attendance Tracker</CardTitle>
          <div className="flex gap-3 items-center">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white text-sm font-medium"
            >
              <option value="">Select a Course</option>
              {attendanceData.map(course => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
            {overallPercentage > 0 && (
              <div className={`px-4 py-2 rounded-lg font-semibold border-2 ${getAttendanceColor(overallPercentage)}`}>
                Overall: {overallPercentage.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {attendanceData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No attendance records found for current semester.
          </div>
        ) : !selectedCourse ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg mb-2">Please select a course to view attendance</div>
          </div>
        ) : (
          // Detailed view for selected course
          <div className="space-y-4">
            {filteredData.map((course) => (
              <div key={course.course_id}>
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">{course.total_classes}</div>
                    <div className="text-sm text-gray-600">Total Classes</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">{course.present}</div>
                    <div className="text-sm text-gray-600">Present</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700">{course.absent}</div>
                    <div className="text-sm text-gray-600">Absent</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center border-2 ${getAttendanceColor(course.percentage)}`}>
                    <div className="text-2xl font-bold">{course.percentage.toFixed(1)}%</div>
                    <div className="text-sm">Attendance</div>
                  </div>
                </div>

                {/* Attendance History */}
                <div>
                  <h4 className="font-semibold mb-3">Attendance History</h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {detailedRecords.map((record) => (
                      <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                        <div className="text-sm font-medium">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusBadge(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    ))}
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