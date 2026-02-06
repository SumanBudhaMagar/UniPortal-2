// components/examhead/MarksEntry.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from '../ui/input';
import { Department, Student, Course, Grade, ExamHead } from './types';
import { getSemesterName } from './utils';

interface MarksEntryProps {
  examHead: ExamHead;
  departments: Department[];
  onGradeSaved?: () => void;
}

interface InternalGrade {
  id: string;
  total_marks: number;
  attendance: number;
  internal: number;
  class_performance: number;
  presentation: number;
  mini_project: number;
  assignment: number;
}

// Function to convert total marks to grade
const convertMarksToGrade = (marks: number): { letter: string; gpa: number } | null => {
  if (marks < 0 || marks > 100) return null;
  
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
  const [examMarks, setExamMarks] = useState('');
  const [examType, setExamType] = useState<'regular' | 'retake'>('regular');
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [saving, setSaving] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [internalGrade, setInternalGrade] = useState<InternalGrade | null>(null);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState<Course | null>(null);
  const [loadingInternal, setLoadingInternal] = useState(false);

  // Calculate final grade
  const calculateFinalGrade = () => {
    if (!examMarks || !selectedCourseInfo) return null;
    
    const examMarksValue = parseFloat(examMarks);
    const teacherMarks = internalGrade?.total_marks || 0;
    const totalMarks = teacherMarks + examMarksValue;
    
    const gradeInfo = convertMarksToGrade(totalMarks);
    
    return {
      totalMarks,
      teacherMarks,
      examMarksValue,
      gradeInfo
    };
  };

  const calculatedResult = calculateFinalGrade();

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

  const loadInternalGrade = async (studentUserId: string, courseId: string) => {
    setLoadingInternal(true);
    const { data, error } = await supabase
      .from('internal_grades')
      .select('*')
      .eq('student_user_id', studentUserId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading internal grade:', error);
    }
    
    setInternalGrade(data || null);
    setLoadingInternal(false);
  };

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedStudentForGrade(null);
    setSelectedCourse('');
    setExamMarks('');
    setEditingGrade(null);
    setStudents([]);
    setCourses([]);
    setStudentGradesForCourses([]);
    setInternalGrade(null);
    setSelectedCourseInfo(null);
    if (deptId && selectedSemester) {
      loadStudents(deptId, selectedSemester);
    }
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedStudentForGrade(null);
    setSelectedCourse('');
    setExamMarks('');
    setEditingGrade(null);
    setStudents([]);
    setCourses([]);
    setStudentGradesForCourses([]);
    setInternalGrade(null);
    setSelectedCourseInfo(null);
    if (selectedDepartment && semester) {
      loadStudents(selectedDepartment, semester);
    }
  };

  const handleStudentSelectForGrade = async (student: Student) => {
    setSelectedStudentForGrade(student);
    setSelectedCourse('');
    setExamMarks('');
    setEditingGrade(null);
    setInternalGrade(null);
    setSelectedCourseInfo(null);
    
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
    setExamMarks('');
    setEditingGrade(null);
    setInternalGrade(null);
    
    const course = courses.find(c => c.id === courseId);
    setSelectedCourseInfo(course || null);
    
    if (selectedStudentForGrade && courseId) {
      await loadInternalGrade(selectedStudentForGrade.user_id, courseId);
    }
    
    const existingGrade = getCourseGradeStatus(courseId);
    if (existingGrade) {
      setExamType(existingGrade.exam_type as 'regular' | 'retake');
    } else {
      setExamType('regular');
    }
  };

  const getCourseGradeStatus = (courseId: string) => {
    return studentGradesForCourses.find(g => g.course_id === courseId);
  };

  const checkAllCoursesGraded = () => {
    const gradedCourseIds = studentGradesForCourses
      .filter(g => g.exam_type === 'regular')
      .map(g => g.course_id);
    const allCourseIds = courses.map(c => c.id);
    
    return allCourseIds.every(courseId => gradedCourseIds.includes(courseId));
  };

  const handlePromoteStudent = async () => {
    if (!selectedStudentForGrade) return;

    if (!checkAllCoursesGraded()) {
      const ungradedCourses = courses.filter(
        c => !studentGradesForCourses.some(g => g.course_id === c.id && g.exam_type === 'regular')
      );
      
      alert(
        `Cannot promote student. Missing grades for:\n\n${ungradedCourses
          .map(c => `- ${c.course_code}: ${c.course_name}`)
          .join('\n')}`
      );
      return;
    }

    const failedCourses = studentGradesForCourses.filter(
      g => g.exam_type === 'regular' && g.status === 'failed'
    );

    if (failedCourses.length > 0) {
      const proceed = confirm(
        `Warning: Student has ${failedCourses.length} failed course(s):\n\n${failedCourses
          .map(g => `- ${g.course_code}: ${g.grade_letter}`)
          .join('\n')}\n\nPromote anyway?`
      );
      
      if (!proceed) return;
    }

    const nextSemester = parseInt(selectedSemester) + 1;
    if (nextSemester > 8) {
      alert('Student is already in the final semester!');
      return;
    }

    if (!confirm(`Promote ${selectedStudentForGrade.name} to ${getSemesterName(nextSemester)}?`)) {
      return;
    }

    setPromoting(true);

    try {
      const { error } = await supabase
        .from('authorized_students')
        .update({ 
          current_semester: nextSemester,
          year: Math.ceil(nextSemester / 2)
        })
        .eq('user_id', selectedStudentForGrade.user_id);

      if (error) throw error;

      alert(`${selectedStudentForGrade.name} promoted to ${getSemesterName(nextSemester)}!`);
      
      await loadStudents(selectedDepartment, selectedSemester);
      setSelectedStudentForGrade(null);
      setStudentGradesForCourses([]);
      
      if (onGradeSaved) onGradeSaved();
    } catch (err) {
      alert('Error promoting student: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setPromoting(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedStudentForGrade || !selectedCourse || !examMarks) {
      alert('Please select a student, course, and enter exam marks');
      return;
    }

    if (!selectedCourseInfo) {
      alert('Course information not loaded');
      return;
    }

    const examMarksValue = parseFloat(examMarks);
    const maxExamMarks = selectedCourseInfo.exam_marks_total || 75;
    
    if (isNaN(examMarksValue) || examMarksValue < 0 || examMarksValue > maxExamMarks) {
      alert(`Please enter valid exam marks between 0 and ${maxExamMarks}`);
      return;
    }

    const result = calculateFinalGrade();
    if (!result || !result.gradeInfo) {
      alert('Error calculating final grade');
      return;
    }

    if (!confirm(editingGrade ? 'Update this grade?' : 'Save this grade?')) {
      return;
    }

    setSaving(true);

    try {
      const gradeData = {
        student_user_id: selectedStudentForGrade.user_id,
        student_email: selectedStudentForGrade.email,
        student_name: selectedStudentForGrade.name,
        student_id: selectedStudentForGrade.student_id,
        course_id: selectedCourse,
        course_name: selectedCourseInfo.course_name,
        course_code: selectedCourseInfo.course_code,
        semester: parseInt(selectedSemester),
        teacher_marks: result.teacherMarks,
        exam_marks: result.examMarksValue,
        total_marks: result.totalMarks,
        grade_letter: result.gradeInfo.letter,
        gpa: result.gradeInfo.gpa,
        status: result.gradeInfo.gpa >= 1.0 ? 'passed' : 'failed',
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

        alert('Grade saved successfully!');
      }

      const { data } = await supabase
        .from('grades')
        .select('*')
        .eq('student_user_id', selectedStudentForGrade.user_id)
        .eq('semester', parseInt(selectedSemester));
      
      if (data) setStudentGradesForCourses(data);

      setSelectedCourse('');
      setExamMarks('');
      setEditingGrade(null);
      setExamType('regular');
      setInternalGrade(null);
      setSelectedCourseInfo(null);
      
      if (onGradeSaved) {
        onGradeSaved();
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setSelectedCourse(grade.course_id);
    setExamMarks(grade.exam_marks?.toString() || '');
    setExamType(grade.exam_type as 'regular' | 'retake');
    
    const course = courses.find(c => c.id === grade.course_id);
    setSelectedCourseInfo(course || null);
    
    if (selectedStudentForGrade && grade.course_id) {
      loadInternalGrade(selectedStudentForGrade.user_id, grade.course_id);
    }
  };

  const handleExamMarksChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setExamMarks(value);
    }
  };

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

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-blue-900">
                          Progress: {studentGradesForCourses.filter(g => g.exam_type === 'regular').length}/{courses.length} courses graded
                        </div>
                        {checkAllCoursesGraded() && (
                          <div className="text-xs text-green-700 mt-1">
                            ✓ All courses graded - Ready to promote!
                          </div>
                        )}
                      </div>
                      {checkAllCoursesGraded() && (
                        <Button
                          onClick={handlePromoteStudent}
                          disabled={promoting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {promoting ? 'Promoting...' : 'Promote'}
                        </Button>
                      )}
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
                      {loadingInternal ? (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">Loading teacher marks...</div>
                        </div>
                      ) : internalGrade ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="font-semibold text-green-800 mb-2">
                            Teacher's Internal Assessment
                          </div>
                          <div className="text-sm space-y-1 text-green-700">
                            {internalGrade.attendance > 0 && <div>Attendance: {internalGrade.attendance}</div>}
                            {internalGrade.internal > 0 && <div>Internal Exam: {internalGrade.internal}</div>}
                            {internalGrade.class_performance > 0 && <div>Class Performance: {internalGrade.class_performance}</div>}
                            {internalGrade.presentation > 0 && <div>Presentation: {internalGrade.presentation}</div>}
                            {internalGrade.mini_project > 0 && <div>Mini Project: {internalGrade.mini_project}</div>}
                            {internalGrade.assignment > 0 && <div>Assignment: {internalGrade.assignment}</div>}
                            <div className="pt-2 mt-2 border-t border-green-300 font-semibold">
                              Total Teacher Marks: {internalGrade.total_marks}/{selectedCourseInfo?.teacher_marks_total || 25}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-sm text-yellow-800">
                            ⚠️ No internal assessment found. Teacher marks will be 0.
                          </div>
                        </div>
                      )}

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
                                  Teacher: <strong>{existingGrade.teacher_marks || 0}</strong> | 
                                  Exam: <strong>{existingGrade.exam_marks || 0}</strong> | 
                                  Total: <strong>{existingGrade.total_marks || 0}</strong>
                                  <br />
                                  Grade: <strong>{existingGrade.grade_letter}</strong> ({existingGrade.gpa}) - {existingGrade.status}
                                  <br />
                                  Type: {existingGrade.exam_type === 'retake' ? 'Retake' : 'Regular'}
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
                            <Label>Exam Marks (0-{selectedCourseInfo?.exam_marks_total || 75})</Label>
                            <Input 
                              type="text"
                              value={examMarks}
                              onChange={(e) => handleExamMarksChange(e.target.value)}
                              placeholder={`Enter exam marks out of ${selectedCourseInfo?.exam_marks_total || 75}`}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Enter only exam marks. Teacher marks will be added automatically.
                            </p>
                          </div>

                          {calculatedResult && examMarks && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm space-y-1">
                                <div className="font-semibold text-blue-900 mb-2">Final Calculation:</div>
                                <div>
                                  Teacher Marks: <strong>{calculatedResult.teacherMarks}</strong>/{selectedCourseInfo?.teacher_marks_total || 25}
                                </div>
                                <div>
                                  Exam Marks: <strong>{calculatedResult.examMarksValue}</strong>/{selectedCourseInfo?.exam_marks_total || 75}
                                </div>
                                <div className="pt-2 mt-2 border-t border-blue-300">
                                  <strong>Total:</strong> {calculatedResult.totalMarks}/100
                                </div>
                                <div>
                                  <strong>Grade:</strong> {calculatedResult.gradeInfo?.letter} ({calculatedResult.gradeInfo?.gpa})
                                </div>
                                <div>
                                  <strong>Status:</strong> {calculatedResult.gradeInfo && calculatedResult.gradeInfo.gpa >= 1.0 ? '✓ Pass' : '✗ Fail'}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveGrade}
                              disabled={saving || !examMarks || !calculatedResult}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {saving ? 'Saving...' : (editingGrade ? 'Update' : 'Save Grade')}
                            </Button>
                            {editingGrade && (
                              <Button
                                onClick={() => {
                                  setEditingGrade(null);
                                  setExamMarks('');
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
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {studentGradesForCourses.map((grade) => (
                          <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-semibold">{grade.course_code}</div>
                              <div className="text-sm text-gray-600">
                                {grade.exam_type === 'retake' && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2">
                                    Retake
                                  </span>
                                )}
                                T: <strong>{grade.teacher_marks || 0}</strong> | 
                                E: <strong>{grade.exam_marks || 0}</strong> | 
                                Total: <strong>{grade.total_marks || 0}</strong>
                                <br />
                                Grade: <strong>{grade.grade_letter}</strong> ({grade.gpa})
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