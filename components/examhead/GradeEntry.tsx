// components/examhead/GradeEntry.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Department, Student, Course, Grade, ExamHead } from './types';
import { getSemesterName, getGradeLetter, getGPAFromGrade } from './utils';

interface GradeEntryProps {
  examHead: ExamHead;
  departments: Department[];
  onGradeSaved?: () => void;
}

export default function GradeEntry({ examHead, departments, onGradeSaved }: GradeEntryProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentGradesForCourses, setStudentGradesForCourses] = useState<Grade[]>([]);
  const [examMarks, setExamMarks] = useState<number>(0);
  const [examType, setExamType] = useState<'regular' | 'retake'>('regular');
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [saving, setSaving] = useState(false);
  const [teacherGrade, setTeacherGrade] = useState<any>(null);
  const [loadingTeacherGrade, setLoadingTeacherGrade] = useState(false);

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

  const loadTeacherGrade = async (studentUserId: string, courseId: string) => {
    setLoadingTeacherGrade(true);
    const { data } = await supabase
      .from('internal_grades')
      .select('*')
      .eq('student_user_id', studentUserId)
      .eq('course_id', courseId)
      .single();

    setTeacherGrade(data || null);
    setLoadingTeacherGrade(false);
  };

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedStudentForGrade(null);
    setSelectedCourse('');
    setExamMarks(0);
    setEditingGrade(null);
    setTeacherGrade(null);
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
    setExamMarks(0);
    setEditingGrade(null);
    setTeacherGrade(null);
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
    setExamMarks(0);
    setEditingGrade(null);
    setTeacherGrade(null);
    
    await loadCourses(selectedDepartment, selectedSemester);
    
    const { data } = await supabase
      .from('grades')
      .select('*')
      .eq('student_user_id', student.user_id)
      .eq('semester', parseInt(selectedSemester));
    
    if (data) setStudentGradesForCourses(data);
  };

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourse(courseId);
    setExamMarks(0);
    setEditingGrade(null);
    setTeacherGrade(null);
    
    if (courseId && selectedStudentForGrade) {
      await loadTeacherGrade(selectedStudentForGrade.user_id, courseId);
      
      const existingGrade = getCourseGradeStatus(courseId);
      if (existingGrade) {
        setExamType(existingGrade.exam_type as 'regular' | 'retake');
        setExamMarks(existingGrade.exam_marks || 0);
      } else {
        setExamType('regular');
      }
    }
  };

  const getCourseGradeStatus = (courseId: string) => {
    return studentGradesForCourses.find(g => g.course_id === courseId);
  };

  const calculateFinalGrade = () => {
    if (!teacherGrade || !selectedCourse) return null;

    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return null;

    const teacherMarks = teacherGrade.total_marks || 0;
    const totalMarks = teacherMarks + examMarks;
    const percentage = totalMarks; // Since total is out of 100
    const gradeLetter = getGradeLetter(percentage);
    const gpa = getGPAFromGrade(gradeLetter);
    const status = gpa >= 1.0 ? 'passed' : 'failed';

    return {
      teacherMarks,
      examMarks,
      totalMarks,
      percentage,
      gradeLetter,
      gpa,
      status,
      teacherMaxMarks: course.teacher_marks_total || 25,
      examMaxMarks: course.exam_marks_total || 75
    };
  };

  const handleSaveGrade = async () => {
    if (!selectedStudentForGrade || !selectedCourse || !teacherGrade) {
      alert('Please select a student and course, and ensure teacher marks are entered');
      return;
    }

    const finalGrade = calculateFinalGrade();
    if (!finalGrade) {
      alert('Error calculating final grade');
      return;
    }

    if (examMarks > finalGrade.examMaxMarks) {
      alert(`Exam marks cannot exceed ${finalGrade.examMaxMarks}`);
      return;
    }

    if (!confirm(editingGrade ? 'Update this grade?' : 'Save this grade?')) {
      return;
    }

    setSaving(true);

    try {
      const course = courses.find(c => c.id === selectedCourse);
      if (!course) {
        alert('Course not found');
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
        teacher_marks: finalGrade.teacherMarks,
        exam_marks: finalGrade.examMarks,
        total_marks: finalGrade.totalMarks,
        grade_letter: finalGrade.gradeLetter,
        gpa: finalGrade.gpa,
        status: finalGrade.status,
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

        // Auto-promote student if regular exam and passed
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

      // Reload grades
      const { data } = await supabase
        .from('grades')
        .select('*')
        .eq('student_user_id', selectedStudentForGrade.user_id)
        .eq('semester', parseInt(selectedSemester));
      
      if (data) setStudentGradesForCourses(data);

      setSelectedCourse('');
      setExamMarks(0);
      setEditingGrade(null);
      setExamType('regular');
      setTeacherGrade(null);
      
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
    setExamMarks(grade.exam_marks || 0);
    setExamType(grade.exam_type as 'regular' | 'retake');
    if (selectedStudentForGrade) {
      loadTeacherGrade(selectedStudentForGrade.user_id, grade.course_id);
    }
  };

  const finalGrade = calculateFinalGrade();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Select Department & Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Department</Label>
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
              <Label>Semester</Label>
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
          <Card>
            <CardHeader>
              <CardTitle>Select Student ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students found in this semester.
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.user_id}
                      onClick={() => handleStudentSelectForGrade(student)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedStudentForGrade?.user_id === student.user_id
                          ? 'bg-purple-100 border-2 border-purple-500'
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

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedStudentForGrade 
                  ? `Enter Exam Marks - ${selectedStudentForGrade.name}` 
                  : 'Select a Student'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStudentForGrade ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Name:</strong> {selectedStudentForGrade.name}</div>
                      <div><strong>ID:</strong> {selectedStudentForGrade.student_id}</div>
                      <div className="col-span-2"><strong>Email:</strong> {selectedStudentForGrade.email}</div>
                    </div>
                  </div>

                  <div>
                    <Label>Select Course</Label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => handleCourseChange(e.target.value)}
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
                      {loadingTeacherGrade ? (
                        <Alert>
                          <AlertDescription>Loading teacher marks...</AlertDescription>
                        </Alert>
                      ) : !teacherGrade ? (
                        <Alert className="bg-orange-50 border-orange-300">
                          <AlertDescription className="text-orange-800">
                            ⚠ Teacher has not entered marks for this student in this course yet.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          {/* Teacher Marks Display */}
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Teacher's Marks</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              {teacherGrade.attendance > 0 && (
                                <div>Attendance: {teacherGrade.attendance}</div>
                              )}
                              {teacherGrade.internal > 0 && (
                                <div>Internal: {teacherGrade.internal}</div>
                              )}
                              {teacherGrade.class_performance > 0 && (
                                <div>Class Perf: {teacherGrade.class_performance}</div>
                              )}
                              {teacherGrade.presentation > 0 && (
                                <div>Presentation: {teacherGrade.presentation}</div>
                              )}
                              {teacherGrade.mini_project > 0 && (
                                <div>Mini Project: {teacherGrade.mini_project}</div>
                              )}
                              {teacherGrade.assignment > 0 && (
                                <div>Assignment: {teacherGrade.assignment}</div>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-blue-300 font-semibold text-blue-900">
                              Total Teacher Marks: {teacherGrade.total_marks} / {finalGrade?.teacherMaxMarks || 25}
                            </div>
                          </div>

                          {/* Check for existing grade */}
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
                                      Exam Marks: <strong>{existingGrade.exam_marks}</strong> / {finalGrade?.examMaxMarks || 75}
                                      <br />
                                      Total: <strong>{existingGrade.total_marks}</strong> / 100
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
                                <Label>Exam Type</Label>
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
                                <Label>Exam Marks (out of {finalGrade?.examMaxMarks || 75})</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={finalGrade?.examMaxMarks || 75}
                                  step="0.5"
                                  value={examMarks}
                                  onChange={(e) => setExamMarks(Math.max(0, Math.min(finalGrade?.examMaxMarks || 75, Number(e.target.value))))}
                                  className="w-full"
                                />
                              </div>

                              {finalGrade && (
                                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
                                  <h4 className="font-semibold text-lg mb-3 text-center">Final Grade Calculation</h4>
                                  <div className="grid grid-cols-2 gap-4 text-center mb-3">
                                    <div>
                                      <div className="text-sm text-gray-600">Teacher Marks</div>
                                      <div className="text-2xl font-bold text-blue-700">
                                        {finalGrade.teacherMarks} / {finalGrade.teacherMaxMarks}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600">Exam Marks</div>
                                      <div className="text-2xl font-bold text-purple-700">
                                        {finalGrade.examMarks} / {finalGrade.examMaxMarks}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="border-t-2 border-green-400 pt-3 grid grid-cols-3 gap-4 text-center">
                                    <div>
                                      <div className="text-sm text-gray-600">Total Marks</div>
                                      <div className="text-3xl font-bold text-green-700">
                                        {finalGrade.totalMarks} / 100
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600">Grade</div>
                                      <div className="text-3xl font-bold text-indigo-700">
                                        {finalGrade.gradeLetter}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600">Status</div>
                                      <div className={`text-2xl font-bold ${finalGrade.status === 'passed' ? 'text-green-700' : 'text-red-700'}`}>
                                        {finalGrade.status === 'passed' ? '✓ PASS' : '✗ FAIL'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-center text-xs text-gray-600 mt-2">
                                    GPA: {finalGrade.gpa} | Percentage: {finalGrade.percentage}%
                                  </div>
                                </div>
                              )}

                              {examType === 'regular' && finalGrade?.status === 'passed' && (
                                <Alert className="bg-blue-50 border-blue-300">
                                  <AlertDescription className="text-blue-800">
                                    ℹ️ Student will be automatically promoted to next semester after saving.
                                  </AlertDescription>
                                </Alert>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSaveGrade}
                                  disabled={saving || examMarks === 0}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  {saving ? 'Saving...' : (editingGrade ? 'Update Grade' : 'Save Grade')}
                                </Button>
                                {editingGrade && (
                                  <Button
                                    onClick={() => {
                                      setEditingGrade(null);
                                      setExamMarks(0);
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
                                Total: {grade.total_marks}/100 | Grade: <strong>{grade.grade_letter}</strong> ({grade.gpa})
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
                  Please select a student from the list to enter their exam marks.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}