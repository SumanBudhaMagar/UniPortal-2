// components/teacher/InternalGradeEntry.tsx

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Student, Course, InternalGrade } from './types';
import { getGradeLetter } from './utils';

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
  // Marks based on course breakdown
  const [marks, setMarks] = useState({
    attendance: 0,
    internal: 0,
    class_performance: 0,
    presentation: 0,
    mini_project: 0,
    assignment: 0
  });
  
  const [remarks, setRemarks] = useState<string>('');
  const [totalMarks, setTotalMarks] = useState(0);
  const [gradeLetter, setGradeLetter] = useState('F');

  // Load existing grade if editing
  useEffect(() => {
    if (existingGrade) {
      setMarks({
        attendance: existingGrade.attendance || 0,
        internal: existingGrade.internal || 0,
        class_performance: existingGrade.class_performance || 0,
        presentation: existingGrade.presentation || 0,
        mini_project: existingGrade.mini_project || 0,
        assignment: existingGrade.assignment || 0
      });
      setRemarks(existingGrade.remarks || '');
    } else {
      setMarks({
        attendance: 0,
        internal: 0,
        class_performance: 0,
        presentation: 0,
        mini_project: 0,
        assignment: 0
      });
      setRemarks('');
    }
  }, [existingGrade, student]);

  // Calculate total and grade whenever marks change
  useEffect(() => {
    const total = Object.values(marks).reduce((sum, val) => sum + val, 0);
    setTotalMarks(total);
    
    // Calculate percentage based on teacher's total allocation
    const teacherTotal = course?.teacher_marks_total || 25;
    const percentage = (total / teacherTotal) * 100;
    setGradeLetter(getGradeLetter(percentage));
  }, [marks, course]);

  const handleSave = async () => {
    if (!student || !course) return;

    await onSave({
      attendance: marks.attendance,
      internal: marks.internal,
      class_performance: marks.class_performance,
      presentation: marks.presentation,
      mini_project: marks.mini_project,
      assignment: marks.assignment,
      total_marks: totalMarks,
      grade_letter: gradeLetter,
      remarks
    });
  };

  if (!student || !course) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Internal Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Select a student to enter internal marks
          </div>
        </CardContent>
      </Card>
    );
  }

  const breakdown = course.teacher_marks_breakdown;
  const teacherTotal = course.teacher_marks_total || 25;

  // Check if marks breakdown is configured
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Internal Marks - {student.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-orange-50 border-orange-300">
            <AlertDescription className="text-orange-800">
              ⚠ Marks breakdown not configured for this course. Please configure it first from the Overview tab.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const components = [
    { key: 'attendance', label: 'Attendance', icon: '📅', max: breakdown.attendance },
    { key: 'internal', label: 'Internal Exams (1+2)', icon: '📝', max: breakdown.internal },
    { key: 'class_performance', label: 'Class Performance', icon: '🎯', max: breakdown.class_performance },
    { key: 'presentation', label: 'Presentation', icon: '🎤', max: breakdown.presentation },
    { key: 'mini_project', label: 'Mini Project', icon: '💻', max: breakdown.mini_project },
    { key: 'assignment', label: 'Assignments', icon: '📄', max: breakdown.assignment }
  ].filter(comp => comp.max > 0); // Only show components with marks allocated

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingGrade ? 'Update' : 'Enter'} Internal Marks - {student.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Student & Course Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div><strong>Student:</strong> {student.name}</div>
              <div><strong>ID:</strong> {student.student_id}</div>
              <div><strong>Course:</strong> {course.course_name}</div>
              <div><strong>Code:</strong> {course.course_code}</div>
            </div>
          </div>

          {/* Marks Scheme Info */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm text-purple-800">
              <strong>Marking Scheme:</strong> Teacher marks out of {teacherTotal} | Exam Head marks out of {course.exam_marks_total || 75}
            </div>
          </div>

          {/* Marks Entry */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Enter Marks for Each Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {components.map((comp) => (
                <div key={comp.key}>
                  <Label className="text-sm font-medium">
                    {comp.icon} {comp.label}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max={comp.max}
                      step="0.5"
                      value={marks[comp.key as keyof typeof marks]}
                      onChange={(e) => {
                        const val = Math.min(comp.max, Math.max(0, Number(e.target.value)));
                        setMarks(prev => ({ ...prev, [comp.key]: val }));
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">/ {comp.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <Label>Remarks (Optional)</Label>
            <Input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any comments about student performance..."
              className="mt-1"
            />
          </div>

          {/* Calculated Grade Display */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Teacher Marks</div>
                <div className="text-3xl font-bold text-green-700">
                  {totalMarks.toFixed(1)} / {teacherTotal}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Percentage</div>
                <div className="text-3xl font-bold text-blue-700">
                  {((totalMarks / teacherTotal) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Provisional Grade</div>
                <div className="text-3xl font-bold text-purple-700">
                  {gradeLetter}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-center text-gray-600">
              * Final grade will be calculated after Exam Head enters exam marks
            </div>
          </div>

          {/* Validation Warning */}
          {totalMarks > teacherTotal && (
            <Alert className="bg-red-50 border-red-300">
              <AlertDescription className="text-red-800">
                ⚠ Total marks ({totalMarks}) exceed maximum ({teacherTotal})
              </AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || totalMarks > teacherTotal}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Saving...' : (existingGrade ? 'Update Marks' : 'Save Marks')}
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="px-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}