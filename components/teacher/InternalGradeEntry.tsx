import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student, Course, InternalGrade } from './types';
import { calculateInternalGrade } from './utils';

interface InternalGradeEntryProps {
  student: Student | null;
  course: Course | null;
  existingGrade: InternalGrade | null;
  onSave: (gradeData: any) => Promise<void>;
  saving: boolean;
}

export default function InternalGradeEntry({
  student,
  course,
  existingGrade,
  onSave,
  saving
}: InternalGradeEntryProps) {
  const [assignmentMarks, setAssignmentMarks] = useState<number>(0);
  const [midtermMarks, setMidtermMarks] = useState<number>(0);
  const [attendanceMarks, setAttendanceMarks] = useState<number>(0);
  const [quizMarks, setQuizMarks] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [calculatedGrade, setCalculatedGrade] = useState({ total: 0, grade: 'F' });

  useEffect(() => {
    if (existingGrade) {
      setAssignmentMarks(existingGrade.assignment_marks || 0);
      setMidtermMarks(existingGrade.midterm_marks || 0);
      setAttendanceMarks(existingGrade.attendance_marks || 0);
      setQuizMarks(existingGrade.quiz_marks || 0);
      setRemarks(existingGrade.remarks || '');
    } else {
      setAssignmentMarks(0);
      setMidtermMarks(0);
      setAttendanceMarks(0);
      setQuizMarks(0);
      setRemarks('');
    }
  }, [existingGrade, student]);

  useEffect(() => {
    const result = calculateInternalGrade({
      assignment: assignmentMarks,
      midterm: midtermMarks,
      attendance: attendanceMarks,
      quiz: quizMarks
    });
    setCalculatedGrade(result);
  }, [assignmentMarks, midtermMarks, attendanceMarks, quizMarks]);

  const handleSave = async () => {
    if (!student || !course) return;

    await onSave({
      assignment_marks: assignmentMarks,
      midterm_marks: midtermMarks,
      attendance_marks: attendanceMarks,
      quiz_marks: quizMarks,
      total_marks: calculatedGrade.total,
      grade_letter: calculatedGrade.grade,
      remarks
    });
  };

  if (!student || !course) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Internal Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Select a student to enter internal grades
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingGrade ? 'Update' : 'Enter'} Internal Grades - {student.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Student & Course Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Student:</strong> {student.name}</div>
              <div><strong>ID:</strong> {student.student_id}</div>
              <div><strong>Course:</strong> {course.course_name}</div>
              <div><strong>Code:</strong> {course.course_code}</div>
            </div>
          </div>

          {/* Marks Entry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assignment Marks (0-25)</Label>
              <Input
                type="number"
                min="0"
                max="25"
                value={assignmentMarks}
                onChange={(e) => setAssignmentMarks(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Midterm Marks (0-30)</Label>
              <Input
                type="number"
                min="0"
                max="30"
                value={midtermMarks}
                onChange={(e) => setMidtermMarks(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Attendance Marks (0-15)</Label>
              <Input
                type="number"
                min="0"
                max="15"
                value={attendanceMarks}
                onChange={(e) => setAttendanceMarks(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Quiz Marks (0-30)</Label>
              <Input
                type="number"
                min="0"
                max="30"
                value={quizMarks}
                onChange={(e) => setQuizMarks(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <Label>Remarks (Optional)</Label>
            <Input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any comments..."
            />
          </div>

          {/* Calculated Grade Display */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Marks (out of 100)</div>
                <div className="text-3xl font-bold text-green-700">
                  {calculatedGrade.total}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Grade</div>
                <div className="text-3xl font-bold text-green-700">
                  {calculatedGrade.grade}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {saving ? 'Saving...' : (existingGrade ? 'Update Grade' : 'Save Grade')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}