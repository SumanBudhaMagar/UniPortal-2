'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

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
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', departmentId)
      .eq('semester', semester)
      .order('course_code');

    if (data) setCurrentCourses(data);
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
        {student && (
          <StudentProfileCard student={student} cgpa={cgpa} />
        )}

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

        {/* All Grades / Academic Results */}
        <AcademicResults grades={allGrades} />
      </div>
    </div>
  );
}