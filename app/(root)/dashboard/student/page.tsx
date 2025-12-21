'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/forms/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/forms/card";

// Type definitions
interface Student {
  id: string;
  email: string;
  name: string;
  student_id: string;
  department: string;
  department_code: string;
  current_semester: number;
  year: number;
}

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  semester: number;
  year: number;
  credits: number;
  teacher_name: string;
}

interface Grade {
  id: string;
  course_name: string;
  course_code: string;
  semester: number;
  grade_letter: string;
  gpa: number;
  status: string;
  exam_type: string;
  created_at: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [failedSubjects, setFailedSubjects] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [cgpa, setCGPA] = useState<number>(0);

  useEffect(() => {
    checkStudentAndLoadData();
  }, []);

  const checkStudentAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'student') {
      router.push('/login');
      return;
    }

    // Get student info from authorized_students table
    const { data: studentData } = await supabase
      .from('authorized_students')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (studentData) {
      setStudent({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
        student_id: user.user_metadata?.student_id,
        department: user.user_metadata?.department,
        department_code: user.user_metadata?.department_code,
        current_semester: studentData.current_semester || 1,
        year: studentData.year || 1
      });

      // Load courses for current semester
      await loadCurrentCourses(studentData.department_id, studentData.current_semester);
      
      // Load grades
      await loadGrades(user.id);
    }

    setLoading(false);
  };

  const loadCurrentCourses = async (departmentId: string, semester: number) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', departmentId)
      .eq('semester', semester)
      .order('course_code');

    if (data) setCurrentCourses(data);
  };

  const loadGrades = async (userId: string) => {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_user_id', userId)
      .order('semester', { ascending: false });

    if (data) {
      setAllGrades(data);
      
      // Filter failed subjects (that haven't been passed in retake)
      const failed = data.filter(grade => {
        if (grade.status === 'failed' && grade.exam_type === 'regular') {
          // Check if there's a passing retake for this course
          const hasPassedRetake = data.some(g => 
            g.course_code === grade.course_code && 
            g.exam_type === 'retake' && 
            g.status === 'passed'
          );
          return !hasPassedRetake;
        }
        return false;
      });
      setFailedSubjects(failed);

      // Calculate CGPA
      if (data.length > 0) {
        const totalGPA = data.reduce((sum, grade) => sum + parseFloat(grade.gpa.toString()), 0);
        const avgGPA = totalGPA / data.length;
        setCGPA(parseFloat(avgGPA.toFixed(2)));
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A-') return 'text-green-600 bg-green-50';
    if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'text-blue-600 bg-blue-50';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-600 bg-yellow-50';
    if (grade === 'D') return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSemesterName = (semester: number) => {
    const year = Math.ceil(semester / 2);
    const sem = semester % 2 === 0 ? 2 : 1;
    return `Year ${year} - Semester ${sem}`;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🎓 Student Dashboard</h1>
            <p className="text-blue-100">Welcome back, {student?.name}!</p>
          </div>
          <Button 
            onClick={handleLogout}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Profile Card */}
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-purple-100">Student ID</div>
                <div className="text-xl font-bold">{student?.student_id}</div>
              </div>
              <div>
                <div className="text-sm text-purple-100">Department</div>
                <div className="text-xl font-bold">{student?.department}</div>
              </div>
              <div>
                <div className="text-sm text-purple-100">Current Semester</div>
                <div className="text-xl font-bold">
                  {getSemesterName(student?.current_semester || 1)}
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-100">CGPA</div>
                <div className="text-xl font-bold">{cgpa.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{currentCourses.length}</div>
              <div className="text-blue-100">Current Courses</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">
                {allGrades.filter(g => g.status === 'passed').length}
              </div>
              <div className="text-green-100">Courses Passed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{failedSubjects.length}</div>
              <div className="text-red-100">Subjects to Retake</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Semester Courses */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Current Semester Courses ({getSemesterName(student?.current_semester || 1)})</CardTitle>
          </CardHeader>
          <CardContent>
            {currentCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No courses assigned for this semester yet. Contact your HOD.
              </div>
            ) : (
              <div className="space-y-3">
                {currentCourses.map((course) => (
                  <div key={course.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{course.course_name}</div>
                      <div className="text-sm text-gray-600">
                        Code: {course.course_code} | Credits: {course.credits} | Teacher: {course.teacher_name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed Subjects to Retake */}
        {failedSubjects.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700">⚠️ Subjects to Retake</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {failedSubjects.map((subject) => (
                  <div key={subject.id} className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <div className="font-semibold">{subject.course_name}</div>
                      <div className="text-sm text-gray-600">
                        Code: {subject.course_code} | Semester: {getSemesterName(subject.semester)} | Grade: {subject.grade_letter}
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      Failed
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Grades / Results */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Academic Results</CardTitle>
          </CardHeader>
          <CardContent>
            {allGrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No results published yet.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group grades by semester */}
                {[...new Set(allGrades.map(g => g.semester))].sort((a, b) => b - a).map(semester => (
                  <div key={semester} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                      {getSemesterName(semester)}
                    </h3>
                    <div className="space-y-2">
                      {allGrades
                        .filter(g => g.semester === semester)
                        .map((grade) => (
                          <div key={grade.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
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
                            <div className="flex items-center gap-4">
                              <div className={`px-4 py-2 rounded-lg font-bold ${getGradeColor(grade.grade_letter)}`}>
                                {grade.grade_letter}
                              </div>
                              <div className="text-gray-600">
                                GPA: {parseFloat(grade.gpa.toString()).toFixed(2)}
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                grade.status === 'passed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {grade.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}