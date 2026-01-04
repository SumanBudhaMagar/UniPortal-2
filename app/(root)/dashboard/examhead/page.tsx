'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GradeEntry from '@/components/examhead/GradeEntry';
import { ExamHead, Department, Student, Grade } from '@/components/examhead/types';
import { getSemesterName } from '@/components/examhead/utils';

export default function ExamHeadDashboard() {
  const router = useRouter();
  const [examHead, setExamHead] = useState<ExamHead | null>(null);
  const [activeTab, setActiveTab] = useState<'enter' | 'view' | 'student'>('enter');
  
  // For View Results Tab
  const [departments, setDepartments] = useState<Department[]>([]);
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

  const loadStudentGrades = async (studentUserId: string) => {
    const { data } = await supabase
      .from('grades')
      .select('*')
      .eq('student_user_id', studentUserId)
      .order('semester', { ascending: true });

    if (data) setStudentGrades(data);
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    await loadStudentGrades(student.user_id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
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
          <GradeEntry 
            examHead={examHead!} 
            departments={departments}
            onGradeSaved={() => {
              loadAllGrades();
              loadAllStudents();
            }}
          />
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