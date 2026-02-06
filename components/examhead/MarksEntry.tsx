// components/examhead/MarksEntry.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from '../ui/input';
import { Department, Student, Course, Grade, ExamHead, GRADE_SCALE } from './types';
import { getSemesterName } from './utils';

interface MarksEntryProps {
  examHead: ExamHead;
  departments: Department[];
  onGradeSaved?: () => void;
}

// Function to convert marks to grade
const convertMarksToGrade = (marks: number): { letter: string; gpa: number } | null => {
  if (marks < 0 || marks > 100) return null;
  
  // Define mark ranges for each grade
  if (marks >= 90) return { letter: 'A+', gpa: 4.0 };
  if (marks >= 85) return { letter: 'A', gpa: 4.0 };
  if (marks >= 80) return { letter: 'A-', gpa: 3.7 };
  if (marks >= 75) return { letter: 'B+', gpa: 3.3 };
  if (marks >= 70) return { letter: 'B', gpa: 3.0 };
  if (marks >= 65) return { letter: 'B-', gpa: 2.7 };
  if (marks >= 60) return { letter: 'C+', gpa: 2.3 };
  if (marks >= 55) return { letter: 'C', gpa: 2.0 };
  if (marks >= 50) return { letter: 'C-', gpa: 1.7 };
  if (marks >= 45) return { letter: 'D+', gpa: 1.3 };
  if (marks >= 40) return { letter: 'D', gpa: 1.0 };
  return { letter: 'F', gpa: 0.0 };
};

export default function MarksEntry({ examHead, departments, onGradeSaved }: MarksEntryProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentGradesForCourses, setStudentGradesForCourses] = useState<Grade[]>([]);
  const [marks, setMarks] = useState('');
  const [examType, setExamType] = useState<'regular' | 'retake'>('regular');
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [saving, setSaving] = useState(false);

  // Calculate grade from current marks input
  const calculatedGrade = marks ? convertMarksToGrade(parseFloat(marks)) : null;

  const loadCourses = async (deptId: string, semester: string) => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', deptId)
      .eq('semester', parseInt(semester))
      .order('course_code');

    if (data) setCourses(data);
  };

  const loadStudents = async (deptId: string, semester: string) => {
    const { data } = await supabase
      .from('authorized_students')
      .select(`
        *,
        departments(name, code)
      `)
      .eq('department_id', deptId)
      .eq('current_semester', parseInt(semester))
      .eq('status', 'registered')
      .order('name');

    if (data) setStudents(data);
  };

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedStudentForGrade(null);
    setSelectedCourse('');
    setMarks('');
    setEditingGrade(null);
    setStudents([]);
    setCourses([]);
    setStudentGradesForCourses([]);
    if (deptId && selectedSemester) {
      loadStudents(deptId, selectedSemester);
    }
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedStudentForGrade(null);
    setSelectedCourse('');
    setMarks('');
    setEditingGrade(null);
    setStudents([]);
    setCourses([]);
    setStudentGradesForCourses([]);
    if (selectedDepartment && semester) {
      loadStudents(selectedDepartment, semester);
    }
  };

  const handleStudentSelectForGrade = async (student: Student) => {
    setSelectedStudentForGrade(student);
    setSelectedCourse('');
    setMarks('');
    setEditingGrade(null);
    
    await loadCourses(selectedDepartment, selectedSemester);
    
    const { data } = await supabase
      .from('grades')
      .select('*')
      .eq('student_user_id', student.user_id)
      .eq('semester', parseInt(selectedSemester));
    
    if (data) setStudentGradesForCourses(data);
  };

  const getCourseGradeStatus = (courseId: string) => {
    return studentGradesForCourses.find(g => g.course_id === courseId);
  };

  const handleSaveGrade = async () => {
    if (!selectedStudentForGrade || !selectedCourse || !marks) {
      alert('Please select a student, course, and enter marks');
      return;
    }

    const marksValue = parseFloat(marks);
    if (isNaN(marksValue) || marksValue < 0 || marksValue > 100) {
      alert('Please enter valid marks between 0 and 100');
      return;
    }

    const gradeInfo = convertMarksToGrade(marksValue);
    if (!gradeInfo) {
      alert('Error calculating grade from marks');
      return;
    }

    if (!confirm(editingGrade ? 'Update this grade?' : 'Save this grade?')) {
      return;
    }

    setSaving(true);

    try {
      const course = courses.find(c => c.id === selectedCourse);
      
      if (!course) {
        alert('Invalid course selection');
        setSaving(false);
        return;
      }

      const gradeData = {
        student_user_id: selectedStudentForGrade.user_id,
        student_email: selectedStudentForGrade.email,
        student_name: selectedStudentForGrade.name,
        student_id: selectedStudentForGrade.student_id,
        course_id: selectedCourse,
        course_name: course.course_name,
        course_code: course.course_code,
        semester: parseInt(selectedSemester),
        exam_marks: marksValue,
        grade_letter: gradeInfo.letter,
        gpa: gradeInfo.gpa,
        status: gradeInfo.gpa >= 1.0 ? 'passed' : 'failed',
        exam_type: examType,
        entered_by: examHead?.id
      };

      if (editingGrade) {
        const { error } = await supabase
          .from('grades')
          .update(gradeData)
          .eq('id', editingGrade.id);

        if (error) {
          alert('Error updating grade: ' + error.message);
          setSaving(false);
          return;
        }

        alert('Grade updated successfully!');
      } else {
        const { error } = await supabase
          .from('grades')
          .insert([gradeData]);

        if (error) {
          if (error.code === '23505') {
            alert('Grade already exists for this student and course. Please use edit button to update.');
          } else {
            alert('Error saving grade: ' + error.message);
          }
          setSaving(false);
          return;
        }

        if (examType === 'regular') {
          const nextSemester = parseInt(selectedSemester) + 1;
          if (nextSemester <= 8) {
            await supabase
              .from('authorized_students')
              .update({ 
                current_semester: nextSemester,
                year: Math.ceil(nextSemester / 2)
              })
              .eq('user_id', selectedStudentForGrade.user_id);
          }
        }

        alert('Grade saved successfully!');
      }

      const { data } = await supabase
        .from('grades')
        .select('*')
        .eq('student_user_id', selectedStudentForGrade.user_id)
        .eq('semester', parseInt(selectedSemester));
      
      if (data) setStudentGradesForCourses(data);

      setSelectedCourse('');
      setMarks('');
      setEditingGrade(null);
      setExamType('regular');
      
      if (onGradeSaved) {
        onGradeSaved();
      }
      
      await loadStudents(selectedDepartment, selectedSemester);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setSelectedCourse(grade.course_id);
    setMarks(grade.marks?.toString() || '');
    setExamType(grade.exam_type as 'regular' | 'retake');
  };

  const handleMarksChange = (value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMarks(value);
    }
  };

  return (
    <>
      <Card className='font-work-sans font-normal login'>
        <CardHeader>
          <CardTitle>Select Department & Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className='py-2'>Department</Label>
              <select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className='py-2'>Semester</Label>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedDepartment}
              >
                {[...Array(8)].map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {getSemesterName(idx + 1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDepartment && selectedSemester && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className='login'>
            <CardHeader>
              <CardTitle>Select Student ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students found in this semester.
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto ">
                  {students.map((student) => (
                    <div
                      key={student.user_id}
                      onClick={() => handleStudentSelectForGrade(student)}
                      className={`p-3 rounded-lg cursor-pointer transition border-[2px] border-black ${
                        selectedStudentForGrade?.user_id === student.user_id
                          ? 'bg-purple-100 border-2'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        ID: {student.student_id}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='login'>
            <CardHeader>
              <CardTitle>
                {selectedStudentForGrade 
                  ? `Enter Marks - ${selectedStudentForGrade.name}` 
                  : 'Select a Student'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStudentForGrade ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border-2 border-black">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Name:</strong> {selectedStudentForGrade.name}</div>
                      <div><strong>ID:</strong> {selectedStudentForGrade.student_id}</div>
                      <div className="col-span-2"><strong>Email:</strong> {selectedStudentForGrade.email}</div>
                    </div>
                  </div>

                  <div>
                    <Label className='py-2'>Select Course</Label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setMarks('');
                        setEditingGrade(null);
                        const existingGrade = getCourseGradeStatus(e.target.value);
                        if (existingGrade) {
                          setExamType(existingGrade.exam_type as 'regular' | 'retake');
                        } else {
                          setExamType('regular');
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => {
                        const gradeStatus = getCourseGradeStatus(course.id);
                        return (
                          <option key={course.id} value={course.id}>
                            {course.course_code} - {course.course_name}
                            {gradeStatus && ` ✓ (${gradeStatus.grade_letter})`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {selectedCourse && (
                    <>
                      {(() => {
                        const existingGrade = getCourseGradeStatus(selectedCourse);
                        return existingGrade && !editingGrade && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-green-800">
                                  Grade Already Entered
                                </div>
                                <div className="text-sm text-green-700 mt-1">
                                  Marks: <strong>{existingGrade.marks || 'N/A'}</strong>
                                  <br />
                                  Grade: <strong>{existingGrade.grade_letter}</strong> ({existingGrade.gpa}) - {existingGrade.status}
                                  <br />
                                  Type: {existingGrade.exam_type === 'retake' ? 'Retake Exam' : 'Regular Exam'}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleEditGrade(existingGrade)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        );
                      })()}

                      {(!getCourseGradeStatus(selectedCourse) || editingGrade) && (
                        <>
                          <div>
                            <Label className='py-2'>Exam Type</Label>
                            <select
                              value={examType}
                              onChange={(e) => setExamType(e.target.value as 'regular' | 'retake')}
                              className="w-full px-3 py-2 border rounded-md"
                            >
                              <option value="regular">Regular Exam</option>
                              <option value="retake">Retake Exam</option>
                            </select>
                          </div>

                          <div>
                            <Label className='py-2'>Marks (0-100)</Label>
                            <Input 
                              type="text"
                              value={marks}
                              onChange={(e) => handleMarksChange(e.target.value)}
                              placeholder="Enter marks"
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Enter marks out of 100
                            </p>
                          </div>

                          {calculatedGrade && marks && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm space-y-1">
                                <div>
                                  <strong>Marks Entered:</strong> {marks}/100
                                </div>
                                <div>
                                  <strong>Calculated Grade:</strong> {calculatedGrade.letter} ({calculatedGrade.gpa})
                                </div>
                                <div>
                                  <strong>Status:</strong> {calculatedGrade.gpa >= 1.0 ? '✓ Pass' : '✗ Fail'}
                                </div>
                                {examType === 'regular' && calculatedGrade.gpa >= 1.0 && (
                                  <div className="mt-2 pt-2 border-t border-blue-300">
                                    <strong className="text-blue-700">Note:</strong> Student will be promoted to next semester after saving.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveGrade}
                              disabled={saving || !marks || !calculatedGrade}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {saving ? 'Saving...' : (editingGrade ? 'Update Grade' : 'Save Grade')}
                            </Button>
                            {editingGrade && (
                              <Button
                                onClick={() => {
                                  setEditingGrade(null);
                                  setMarks('');
                                  setExamType('regular');
                                }}
                                className="bg-gray-500 hover:bg-gray-600"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {studentGradesForCourses.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Grades Entered ({studentGradesForCourses.length})</h3>
                      <div className="space-y-2">
                        {studentGradesForCourses.map((grade) => (
                          <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-semibold">{grade.course_code}</div>
                              <div className="text-sm text-gray-600">
                                {grade.exam_type === 'retake' && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2">
                                    Retake
                                  </span>
                                )}
                                Marks: <strong>{grade.marks || 'N/A'}</strong> | Grade: <strong>{grade.grade_letter}</strong> ({grade.gpa})
                              </div>
                            </div>
                            <Button
                              onClick={() => handleEditGrade(grade)}
                              className="bg-blue-600 hover:bg-blue-700 text-sm py-1 px-3"
                            >
                              Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Please select a student from the list to enter their marks.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}