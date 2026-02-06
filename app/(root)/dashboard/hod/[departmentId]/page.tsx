// app/dashboard/hod/[departmentId]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";

// Import components
import StatsCards from '@/components/hod/StatsCards';
import StudentManagement from '@/components/hod/StudentManagement';
import TeacherManagement from '@/components/hod/TeacherManagement';
import CourseManagement from '@/components/hod/CourseManagement';
import { toast } from 'react-toastify';

// Import types and utils
import type { 
  HOD, 
  Department, 
  Student, 
  Teacher, 
  Course, 
  NewStudent, 
  NewTeacher, 
  NewCourse 
} from '@/components/hod/types';
import { validateStudentEmail } from '@/components/hod/utils';

export default function HODDashboard() {
  const router = useRouter();
  const params = useParams();
  const [hod, setHod] = useState<HOD | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const checkHODAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'hod') {
      router.push('/login');
      return;
    }

    if (user.user_metadata?.department_id !== params.departmentId) {
      router.push('/login');
      return;
    }

    setHod({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
      department_id: user.user_metadata?.department_id,
      department_name: user.user_metadata?.department_name
    });

    const { data: deptData } = await supabase
      .from('departments')
      .select('*')
      .eq('id', params.departmentId)
      .single();

    setDepartment(deptData);

    await loadStudents();
    await loadTeachers();
    await loadCourses();
    setLoading(false);
  };

  useEffect(() => {
    void checkHODAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async () => {
    const { data } = await supabase
      .from('authorized_students')
      .select('*')
      .eq('department_id', params.departmentId)
      .order('created_at', { ascending: false });

    if (data) setStudents(data);
  };

  const loadTeachers = async () => {
    const { data, error } = await supabase
      .from('authorized_teachers')
      .select('*')
      .eq('department_id', params.departmentId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error loading teachers: ' + error.message);
      return;
    }

    if (data) setTeachers(data as Teacher[]);
  };

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', params.departmentId)
      .order('semester', { ascending: true })
      .order('course_code');

    if (data) setCourses(data);
  };

  const handleAddStudent = async (newStudent: NewStudent) => {
  if (!validateStudentEmail(newStudent.email)) {
    toast.info('Student email must end with @student.ku.edu.np');
    return;
  }

  const semester = parseInt(newStudent.semester);
  const year = Math.ceil(semester / 2);

  const { error } = await supabase
    .from('authorized_students')
    .insert([{
      name: newStudent.name,
      email: newStudent.email,
      student_id: newStudent.studentId,
      department_id: params.departmentId,
      status: 'pending',
      current_semester: semester,  // ADD THIS
      year: year                    // ADD THIS
    }]);

  if (!error) {
    toast.success('Student added successfully! They can now register with this email.');
    loadStudents();
  } else {
    if (error.code === '23505') {
      toast.info('This email is already registered for this department.');
    } else {
      toast.error('Error: ' + error.message);
    }
  }
};

  const handleBulkUpload = async (csvFile: File) => {
  const reader = new FileReader();
  
  reader.onload = async (event) => {
    const text = event.target?.result as string;
    const lines = text.split('\n').filter(line => line.trim());
    const dataLines = lines.slice(1);
    
    if (dataLines.length === 0) {
      toast.info('CSV file is empty');
      return;
    }

    const studentsToAdd = [];
    let errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const [name, email, studentId, semester] = line.split(',').map(s => s.trim());

      if (!name || !email || !studentId || !semester) {
        errors.push(`Row ${i + 2}: Missing data`);
        continue;
      }

      if (!validateStudentEmail(email)) {
        errors.push(`Row ${i + 2}: Invalid email format - ${email}`);
        continue;
      }

      const semesterNum = parseInt(semester);
      if (semesterNum < 1 || semesterNum > 8) {
        errors.push(`Row ${i + 2}: Invalid semester - ${semester}`);
        continue;
      }

      const year = Math.ceil(semesterNum / 2);

      studentsToAdd.push({
        name,
        email,
        student_id: studentId,
        department_id: params.departmentId,
        status: 'pending',
        current_semester: semesterNum,  // ADD THIS
        year: year                       // ADD THIS
      });
    }

    if (studentsToAdd.length === 0) {
      toast.info('No valid students to add');
      return;
    }

    const { error } = await supabase
      .from('authorized_students')
      .insert(studentsToAdd);

    if (error) {
      toast.error('Error uploading students: ' + error.message);
    } else {
      let message = `Successfully added ${studentsToAdd.length} students!`;
      if (errors.length > 0) {
        message += `\n\nErrors:\n${errors.join('\n')}`;
      }
      toast.success(message);
      loadStudents();
    }
  };

  reader.readAsText(csvFile);
};
  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to remove this student authorization?')) return;
    
    const { error } = await supabase
      .from('authorized_students')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Student removed!');
      loadStudents();
    }
  };

  const handleAddTeacher = async (newTeacher: NewTeacher) => {
    const teacherEmail = newTeacher.email.toLowerCase().trim();
    const teacherId = newTeacher.teacherId.trim();

    if (!teacherEmail) {
      toast.info('Please enter teacher email');
      return;
    }

    if (!teacherId) {
      toast.info('Please enter teacher ID');
      return;
    }

    if (teacherEmail.endsWith('@student.ku.edu.np')) {
      toast.info('Invalid teacher email.');
      return;
    }

    const { error } = await supabase
      .from('authorized_teachers')
      .insert([
        {
          email: teacherEmail,
          teacher_id: teacherId,
          department_id: params.departmentId,
          status: 'pending'
        }
      ]);

    if (!error) {
      toast.success('Teacher email authorized! They can now register with this email.');
      loadTeachers();
    } else {
      if (error.code === '23505') {
        toast.info('This teacher email is already authorized.');
      } else {
        toast.error('Error: ' + error.message);
      }
    }
  };

  const handleAddCourse = async (newCourse: NewCourse) => {
    const teacher = teachers.find(t => t.user_id === newCourse.teacherId);
    
    const { error } = await supabase
      .from('courses')
      .insert([{
        course_name: newCourse.courseName,
        course_code: newCourse.courseCode,
        department_id: params.departmentId,
        semester: parseInt(newCourse.semester),
        year: parseInt(newCourse.year),
        credits: parseInt(newCourse.credits),
        teacher_id: newCourse.teacherId || null,
        teacher_name: teacher?.name || null,
        created_by: hod?.id
      }]);

    if (!error) {
      toast.success('Course added successfully!');
      loadCourses();
    } else {
      if (error.code === '23505') {
        toast.info('A course with this code already exists.');
      } else {
        toast.error('Error: ' + error.message);
      }
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Course deleted!');
      loadCourses();
    }
  };

  const handleAssignTeacherToCourse = async (courseId: string, teacherUserId: string | null) => {
    const teacher = teacherUserId ? teachers.find(t => t.user_id === teacherUserId) : null;

    const { error } = await supabase
      .from('courses')
      .update({
        teacher_id: teacherUserId,
        teacher_name: teacher?.name || null,
      })
      .eq('id', courseId);

    if (!error) {
      toast.success('Course teacher updated!');
      loadCourses();
    } else {
      toast.error('Error: ' + error.message);
    }
  };

  const handleUpdateCourseMarksScheme = async (
    courseId: string,
    payload: {
      teacher_marks_total: number;
      exam_marks_total: number;
    }
  ) => {
    const { error } = await supabase
      .from('courses')
      .update({
        teacher_marks_total: payload.teacher_marks_total,
        exam_marks_total: payload.exam_marks_total,
      })
      .eq('id', courseId);

    if (!error) {
      toast.success('Course marks scheme updated!');
      loadCourses();
    } else {
      toast.error('Error: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-orange-50 font-work-sans">
      {/* Header */}
      <div className="yellow_container text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-end justify-end">
          <div>
            <h1 className="heading text-3xl font-bold relative right-[-108px]">HOD Dashboard</h1>
            <p className="font-medium text-[30px] text-white max-w-2xl text-center break-words relative right-[-100px]">{department?.name} Department</p>
            <p className="sub-heading text-purple-100 relative right-[-100px]">Welcome, {hod?.name}</p>
          </div>
          <Button 
            onClick={handleLogout}
            className="bg-white text-black hover:bg-gray-200 tag"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Stats */}
        <StatsCards 
          students={students} 
          teachers={teachers} 
          courses={courses} 
        />

        {/* Students Management */}
        <StudentManagement
          students={students}
          onAddStudent={handleAddStudent}
          onBulkUpload={handleBulkUpload}
          onDeleteStudent={handleDeleteStudent}
        />

        {/* Teachers Management */}
        <TeacherManagement
          teachers={teachers}
          onAddTeacher={handleAddTeacher}
        />

        {/* Courses Management */}
        <CourseManagement
          courses={courses}
          teachers={teachers}
          onAddCourse={handleAddCourse}
          onDeleteCourse={handleDeleteCourse}
          onAssignTeacher={handleAssignTeacherToCourse}
          onUpdateMarksScheme={handleUpdateCourseMarksScheme}
        />
      </div>
    </div>
  );
}