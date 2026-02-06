'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ExamHead, Department, Student, Grade } from '@/components/examhead/types';
import { getSemesterName } from '@/components/examhead/utils';
import MarksEntry from '@/components/examhead/MarksEntry';


export default function ExamHeadDashboard() {
  const router = useRouter();
  const [examHead, setExamHead] = useState<ExamHead | null>(null);
  const [activeTab, setActiveTab] = useState<'enter'  | 'student'>('enter');
  
  // For View Results Tab
  const [departments, setDepartments] = useState<Department[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allGrades, setAllGrades] = useState<any[] | null>([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // For Student View Tab
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);

  

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
  // Get all grades
  const { data: gradesData, error: gradesError } = await supabase
    .from('grades')
    .select('*')
    .order('created_at', { ascending: false });

  if (gradesError) {
    console.error("Grades error:", gradesError);
    setAllGrades([]);
    return;
  }

  // Get all authorized students with departments
  const { data: studentsData, error: studentsError } = await supabase
    .from('authorized_students')
    .select(`
      user_id,
      name,
      email,
      student_id,
      department_id,
      departments(id, name, code)
    `);

  if (studentsError) {
    console.error("Students error:", studentsError);
    setAllGrades([]);
    return;
  }

  // Create a map for quick lookup
  const studentsMap = new Map(
    studentsData?.map(student => [student.user_id, student]) || []
  );

  // Combine the data
  const enrichedGrades = gradesData?.map(grade => ({
    ...grade,
    authorized_students: studentsMap.get(grade.student_user_id) || null
  })) || [];

  console.log("Total grades found:", enrichedGrades.length);
  setAllGrades(enrichedGrades);
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
  

  const filteredGrades = allGrades?.filter(grade => {
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
  useEffect(() => {
    checkExamHeadAndLoadData();
  }, []);

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
          <MarksEntry 
            examHead={examHead!} 
            departments={departments}
            onGradeSaved={() => {
              loadAllGrades();
              loadAllStudents();
            }}
          />
        )}


{activeTab === 'student' && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Student Selection Sidebar */}
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Select Student</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Department Filter */}
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
           <div> <Label>Semester</Label> <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="w-full px-3 py-2 border rounded-md" > <option value="">All Semesters</option> {[...Array(8)].map((_, idx) => ( <option key={idx + 1} value={idx + 1}> {getSemesterName(idx + 1)} </option> ))} </select> </div>

          {/* Search Box */}
          <div>
            <Label>Search</Label>
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Student List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {allStudents
              .filter(student => {
                const matchesDept = !filterDept || student.department_id === filterDept;
                const matchesSearch = !searchQuery || 
                  student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  student.student_id.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesDept && matchesSearch;
              })
              .map((student) => (
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
                    ID: {student.student_id}
                  </div>
                  <div className="text-xs text-gray-500">
                    {student.departments?.name}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Academic Record Display */}
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          {selectedStudent ? `Academic Record - ${selectedStudent.name}` : 'Select a Student'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedStudent ? (
          <div className="space-y-6">
            {/* Student Info Header */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Student Name</div>
                  <div className="font-semibold">{selectedStudent.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Student ID</div>
                  <div className="font-semibold">{selectedStudent.student_id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Department</div>
                  <div className="font-semibold">{selectedStudent.departments?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Current Semester</div>
                  <div className="font-semibold">{getSemesterName(selectedStudent.current_semester)}</div>
                </div>
              </div>
            </div>

            {/* Grades by Semester */}
            {studentGrades.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No grades recorded yet for this student.
              </div>
            ) : (
              <div className="space-y-6">
                {[...new Set(studentGrades.map(g => g.semester))].sort().map(semester => {
                  const semesterGrades = studentGrades.filter(g => g.semester === semester);
                  const semesterGPA = (
                    semesterGrades.reduce((sum, g) => sum + parseFloat(g.gpa.toString()), 0) / 
                    semesterGrades.length
                  ).toFixed(2);
                  const totalCredits = semesterGrades.length * 3; // Assuming 3 credits per course

                  return (
                    <div key={semester} className="border rounded-lg overflow-hidden">
                      {/* Semester Header */}
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">
                            {getSemesterName(semester)}
                          </h3>
                          <div className="text-right">
                            <div className="text-sm opacity-90">Semester GPA</div>
                            <div className="text-2xl font-bold">{semesterGPA}</div>
                          </div>
                        </div>
                      </div>

                      {/* Grades Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Course Code</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Course Title</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Credit</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Grade</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Grade Value</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Grade Points</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {semesterGrades.map((grade, idx) => {
                              const credits = 3; // Assuming 3 credits per course
                              const gradePoints = parseFloat(grade.gpa.toString()) * credits;
                              
                              return (
                                <tr 
                                  key={grade.id} 
                                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                  <td className="px-4 py-3 text-sm font-medium">{grade.course_code}</td>
                                  <td className="px-4 py-3 text-sm">{grade.course_name}</td>
                                  <td className="px-4 py-3 text-sm text-center">{credits}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="font-bold text-lg">{grade.grade_letter}</span>
                                    {grade.exam_type === 'retake' && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        Retake
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center">{parseFloat(grade.gpa.toString()).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-sm text-center font-semibold">{gradePoints.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                      grade.status === 'passed'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {grade.status === 'passed' ? 'Pass' : 'Fail'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Semester Total Row */}
                            <tr className="bg-purple-50 font-semibold border-t-2 border-purple-200">
                              <td className="px-4 py-3 text-sm" colSpan={2}>Total</td>
                              <td className="px-4 py-3 text-sm text-center">{totalCredits}</td>
                              <td className="px-4 py-3 text-sm text-center" colSpan={2}></td>
                              <td className="px-4 py-3 text-sm text-center">
                                {semesterGrades.reduce((sum, g) => sum + (parseFloat(g.gpa.toString()) * 3), 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-center"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Semester Footer */}
                      <div className="bg-gray-50 px-4 py-3 border-t">
                        <div className="text-sm">
                          <strong>GPA (Grade Point Average) = {semesterGPA}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Overall Summary */}
                {studentGrades.length > 0 && (
                  <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm opacity-90">Total Courses</div>
                        <div className="text-3xl font-bold">{studentGrades.length}</div>
                      </div>
                      <div>
                        <div className="text-sm opacity-90">Cumulative GPA</div>
                        <div className="text-3xl font-bold">
                          {(studentGrades.reduce((sum, g) => sum + parseFloat(g.gpa.toString()), 0) / studentGrades.length).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-90">Passed Courses</div>
                        <div className="text-3xl font-bold">
                          {studentGrades.filter(g => g.status === 'passed').length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <div className="text-xl font-semibold mb-2">Select a Student</div>
            <div className="text-sm">Choose a student from the list to view their complete academic record</div>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)}

        
      </div>
    </div>
  );
}