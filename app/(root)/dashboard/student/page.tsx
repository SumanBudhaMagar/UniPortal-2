'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

// Import components
import StudentProfileCard from '@/components/student/StudentProfileCard';
import StudentStatsCards from '@/components/student/StudentStatsCards';
import CurrentCoursesList from '@/components/student/CurrentCoursesList';
import FailedSubjectsList from '@/components/student/FailedSubjectsList';
import AcademicResults from '@/components/student/AcademicResults';

// Import types and utils
import type { Student, Course, Grade } from '@/components/student/types';
import { calculateCGPA } from '@/components/student/utils';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [failedSubjects, setFailedSubjects] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [cgpa, setCGPA] = useState<number>(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);

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

    if (!studentData) {
      setLoading(false);
      return;
    }

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

    // Load courses for current semester and get returned array
    const courses = await loadCurrentCourses(studentData.department_id, studentData.current_semester);

    // Load grades
    await loadGrades(user.id);

    // Load announcements for the student’s courses
    await loadAnnouncements(courses.map(c => c.id));

    setLoading(false);
  };

  const loadCurrentCourses = async (departmentId: string, semester: number) => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', departmentId)
      .eq('semester', semester)
      .order('course_code');

    if (data) setCurrentCourses(data);
    return data || [];
  };

  const loadAnnouncements = async (courseIds: string[]) => {
    if (!courseIds || courseIds.length === 0) return;

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .in('course_id', courseIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading announcements:', error.message);
      return;
    }

    setAnnouncements(data || []);
  };

  const loadGrades = async (userId: string) => {
    const { data } = await supabase
      .from('grades')
      .select('*')
      .eq('student_user_id', userId)
      .order('semester', { ascending: false });

    if (data) {
      setAllGrades(data);
      
      // Filter failed subjects (that haven't been passed in retake)
      const failed = data.filter(grade => {
        if (grade.status === 'failed' && grade.exam_type === 'regular') {
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

      // Calculate CGPA using utility function
      setCGPA(calculateCGPA(data));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
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
        {student && <StudentProfileCard student={student} cgpa={cgpa} />}

        {/* Stats Cards */}
        <StudentStatsCards 
          currentCourses={currentCourses}
          allGrades={allGrades}
          failedSubjects={failedSubjects}
        />

        {/* Current Semester Courses */}
        <CurrentCoursesList 
          courses={currentCourses}
          currentSemester={student?.current_semester || 1}
        />

        {/* Failed Subjects to Retake */}
        <FailedSubjectsList failedSubjects={failedSubjects} />

        {/* Academic Results */}
        <AcademicResults grades={allGrades} />

        {/* Announcements */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📢 Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No announcements for your courses yet.
              </div>
            ) : (
              <div className="space-y-4">
                {announcements
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((a) => (
                    <div
                      key={a.id}
                      className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200
                        ${a.priority === 'high' 
                          ? 'bg-red-50 border-red-400' 
                          : 'bg-yellow-50 border-yellow-200'}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {a.course_name && (
                            <div className="text-sm text-gray-500 mb-1">{a.course_name}</div>
                          )}
                          <div className="font-semibold text-gray-800">{a.title}</div>
                          <p className="text-gray-700 mt-1">{a.message}</p>
                        </div>
                        <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                          {new Date(a.created_at).toLocaleDateString()} <br />
                          {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
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
