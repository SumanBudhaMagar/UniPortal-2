import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Student, Course } from './types';

interface AttendanceManagementProps {
  students: Student[];
  course: Course | null;
  onMarkAttendance: (attendanceData: any[]) => Promise<void>;
}

export default function AttendanceManagement({
  students,
  course,
  onMarkAttendance
}: AttendanceManagementProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [saving, setSaving] = useState(false);

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    if (!course) return;

    setSaving(true);
    const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => {
      const student = students.find(s => s.user_id === studentId);
      return {
        student_user_id: studentId,
        student_name: student?.name,
        course_id: course.id,
        date,
        status
      };
    });

    await onMarkAttendance(attendanceRecords);
    setAttendance({});
    setSaving(false);
  };

  const markAllPresent = () => {
    const allPresent: Record<string, 'present'> = {};
    students.forEach(s => {
      allPresent[s.user_id] = 'present';
    });
    setAttendance(allPresent);
  };

  if (!course) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📋 Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Select a course to mark attendance
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Mark Attendance - {course.course_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <Button
              onClick={markAllPresent}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark All Present
            </Button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {students.map((student) => (
              <div
                key={student.user_id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.student_id}</div>
                </div>
                <div className="flex gap-2">
                  {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleAttendanceChange(student.user_id, status)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        attendance[student.user_id] === status
                          ? status === 'present'
                            ? 'bg-green-600 text-white'
                            : status === 'absent'
                            ? 'bg-red-600 text-white'
                            : status === 'late'
                            ? 'bg-orange-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || Object.keys(attendance).length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

