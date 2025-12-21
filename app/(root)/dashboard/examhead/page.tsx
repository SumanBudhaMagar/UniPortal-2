'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Type definitions
interface ExamHead {
  id: string;
  email: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Student {
  user_id: string;
  name: string;
  email: string;
  student_id: string;
  department_id: string;
  current_semester: number;
  department?: {
    name: string;
    code: string;
  };
  departments?: {
    name: string;
    code: string;
  };
}

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  semester: number;
  department_id: string;
  credits: number;
}

interface Grade {
  id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  semester: number;
  grade_letter: string;
  gpa: number;
  status: string;
  exam_type: string;
  created_at: string;
  student_user_id?: string;
}

export default function ExamHeadDashboard() {
  const router = useRouter();
  const [examHead, setExamHead] = useState<ExamHead | null>(null);
  const [activeTab, setActiveTab] = useState<'enter' | 'view' | 'student'>('enter');
  
  // For Enter Grades Tab
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentGradesForCourses, setStudentGradesForCourses] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [examType, setExamType] = useState<'regular' | 'retake'>('regular');
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  
  // For View Results Tab
  const [allGrades, setAllGrades] = useState<any[]>([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // For Student View Tab
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const gradeScale = [
    { letter: 'A', gpa: 4.0 },
    { letter: 'A-', gpa: 3.7 },
    { letter: 'B+', gpa: 3.3 },
    { letter: 'B', gpa: 3.0 },
    { letter: 'B-', gpa: 2.7 },
    { letter: 'C+', gpa: 2.3 },
    { letter: 'C', gpa: 2.0 },
    { letter: 'D', gpa: 1.0 },
    { letter: 'F', gpa: 0.0 },
  ];

  useEffect(() => {
    checkExamHeadAndLoadData();
  }, []);

  const checkExamHeadAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'exam_head') {
      router.push('/login');
      return;
    }

    setExamHead({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name
    });

    const { data: depts } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (depts) setDepartments(depts);

    await loadAllGrades();
    await loadAllStudents();

    setLoading(false);
  };

  const loadAllGrades = async () => {
    const { data } = await supabase
      .from('grades')
      .select(`
        *,
        authorized_students!inner(name, email, student_id, departments(name, code))
      `)
      .order('created_at', { ascending: false });

    if (data) setAllGrades(data);
  };

  const loadAllStudents = async () => {
    const { data } = await supabase
      .from('authorized_students')
      .select(`
        *,
        departments(name, code)
      `)
      .eq('status', 'registered')
      .order('name');

    if (data) setAllStudents(data);
  };

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

  const loadStudentGrades = async (studentUserId: string) => {
    const { data } = await supabase
      .from('grades')
      .select('*')
      .eq('student_user_id', studentUserId)
      .order('semester', { ascending: true });

    if (data) setStudentGrades(data);
  };

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedStudentForGrade(null);
    setSelectedCourse('');
    setSelectedGrade('');
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
    setSelectedGrade('');
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
    setSelectedGrade('');
    setEditingGrade(null);
    
    await loadCourses(selectedDepartment, selectedSemester);
    
    const { data } = await supabase
      .from('grades')
      .select('*')
      .eq('student_user_id', student.user_id)
      .eq('semester', parseInt(selectedSemester));
    
    if (data) setStudentGradesForCourses(data);
  };

  const handleSaveGrade = async () => {
    if (!selectedStudentForGrade || !selectedCourse || !selectedGrade) {
      alert('Please select a student, course, and grade');
      return;
    }

    if (!confirm(editingGrade ? 'Update this grade?' : 'Save this grade?')) {
      return;
    }

    setSaving(true);

    try {
      const course = courses.find(c => c.id === selectedCourse);
      const gradeInfo = gradeScale.find(g => g.letter === selectedGrade);
      
      if (!course || !gradeInfo) {
        alert('Invalid course or grade selection');
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
      setSelectedGrade('');
      setEditingGrade(null);
      setExamType('regular');
      
      await loadAllGrades();
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
    setSelectedGrade(grade.grade_letter);
    setExamType(grade.exam_type as 'regular' | 'retake');
  };

  const getCourseGradeStatus = (courseId: string) => {
    return studentGradesForCourses.find(g => g.course_id === courseId);
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    await loadStudentGrades(student.user_id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getSemesterName = (semester: number) => {
    const year = Math.ceil(semester / 2);
    const sem = semester % 2 === 0 ? 2 : 1;
    return `Year ${year} - Semester ${sem}`;
  };

  const filteredGrades = allGrades.filter(grade => {
    const matchesDept = !filterDept || grade.authorized_students?.departments?.id === filterDept;
    const matchesSem = !filterSemester || grade.semester === parseInt(filterSemester);
    const matchesSearch = !searchQuery || 
      grade.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.course_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDept && matchesSem && matchesSearch;
  });

  const filteredStudents = allStudents.filter(student => {
    return student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
           student.email.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
           student.student_id.toLowerCase().includes(studentSearchQuery.toLowerCase());
  });

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📝 Exam Head Dashboard</h1>
            <p className="text-purple-100">Welcome, {examHead?.name}</p>
          </div>
          <Button 
            onClick={handleLogout}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('enter')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'enter'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📝 Enter Grades
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'view'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 View All Results
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'student'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👤 View Student Records
          </button>
        </div>

        {activeTab === 'enter' && (
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
                        ? `Enter Grade - ${selectedStudentForGrade.name}` 
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
                            onChange={(e) => {
                              setSelectedCourse(e.target.value);
                              setSelectedGrade('');
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
                                  <Label>Grade</Label>
                                  <select
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                  >
                                    <option value="">Select Grade</option>
                                    {gradeScale.map((grade) => (
                                      <option key={grade.letter} value={grade.letter}>
                                        {grade.letter} ({grade.gpa}) - {grade.gpa >= 1.0 ? 'Pass' : 'Fail'}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {selectedGrade && (
                                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                    <div className="text-sm">
                                      <strong>Selected Grade:</strong> {selectedGrade} ({gradeScale.find(g => g.letter === selectedGrade)?.gpa})
                                      <br />
                                      <strong>Status:</strong> {(gradeScale.find(g => g.letter === selectedGrade)?.gpa || 0) >= 1.0 ? '✓ Pass' : '✗ Fail'}
                                      {examType === 'regular' && (
                                        <>
                                          <br />
                                          <strong className="text-blue-700">Note:</strong> Student will be promoted to next semester after saving.
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleSaveGrade}
                                    disabled={saving || !selectedGrade}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    {saving ? 'Saving...' : (editingGrade ? 'Update Grade' : 'Save Grade')}
                                  </Button>
                                  {editingGrade && (
                                    <Button
                                      onClick={() => {
                                        setEditingGrade(null);
                                        setSelectedGrade('');
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
                        Please select a student from the list to enter their grades.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {activeTab === 'view' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Filter Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Department</Label>
                    <select
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">All Departments</option>
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
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">All Semesters</option>
                      {[...Array(8)].map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {getSemesterName(idx + 1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Search</Label>
                    <Input
                      placeholder="Search by name, ID, or course..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Published Results ({filteredGrades.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredGrades.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No results found matching your filters.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-gray-100 rounded-lg font-semibold sticky top-0">
                      <div className="col-span-2">Student</div>
                      <div className="col-span-2">Student ID</div>
                      <div className="col-span-2">Department</div>
                      <div className="col-span-2">Course</div>
                      <div className="col-span-1">Semester</div>
                      <div className="col-span-1">Grade</div>
                      <div className="col-span-1">Type</div>
                      <div className="col-span-1">Status</div>
                    </div>
                    {filteredGrades.map((grade) => (
                      <div key={grade.id} className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg items-center text-sm">
                        <div className="col-span-2">{grade.student_name}</div>
                        <div className="col-span-2 text-gray-600">{grade.student_id}</div>
                        <div className="col-span-2 text-gray-600">{grade.authorized_students?.departments?.name}</div>
                        <div className="col-span-2">{grade.course_code}</div>
                        <div className="col-span-1">{grade.semester}</div>
                        <div className="col-span-1">
                          <span className="font-bold">{grade.grade_letter}</span> ({grade.gpa})
                        </div>
                        <div className="col-span-1">
                          {grade.exam_type === 'retake' ? (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Retake</span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Regular</span>
                          )}
                        </div>
                        <div className="col-span-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            grade.status === 'passed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {grade.status === 'passed' ? '✓ Pass' : '✗ Fail'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'student' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Search Student</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by name, email, or student ID..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.user_id}
                        onClick={() => handleStudentSelect(student)}
                        className={`p-3 rounded-lg cursor-pointer transition ${
                          selectedStudent?.user_id === student.user_id
                            ? 'bg-purple-100 border-2 border-purple-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-sm text-gray-600">
                          ID: {student.student_id} | {student.departments?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Current: {getSemesterName(student.current_semester)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedStudent ? `${selectedStudent.name}'s Records` : 'Select a Student'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedStudent ? (
                    <>
                      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><strong>Student ID:</strong> {selectedStudent.student_id}</div>
                          <div><strong>Email:</strong> {selectedStudent.email}</div>
                          <div><strong>Department:</strong> {selectedStudent.departments?.name}</div>
                          <div><strong>Current Semester:</strong> {getSemesterName(selectedStudent.current_semester)}</div>
                        </div>
                      </div>

                      {studentGrades.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No grades recorded yet for this student.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {[...new Set(studentGrades.map(g => g.semester))].sort().map(semester => (
                            <div key={semester}>
                              <h3 className="font-semibold text-lg mb-2">
                                {getSemesterName(semester)}
                              </h3>
                              <div className="space-y-2">
                                {studentGrades.filter(g => g.semester === semester).map((grade) => (
                                  <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <div className="font-semibold">{grade.course_name}</div>
                                      <div className="text-sm text-gray-600">
                                        {grade.course_code}
                                        {grade.exam_type === 'retake' && (
                                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            Retake
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-lg font-bold">{grade.grade_letter}</div>
                                      <div className="text-sm text-gray-600">({parseFloat(grade.gpa.toString()).toFixed(2)})</div>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        grade.status === 'passed'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {grade.status === 'passed' ? '✓' : '✗'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Select a student from the list to view their complete exam records.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}