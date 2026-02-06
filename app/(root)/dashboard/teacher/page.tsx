'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';


import TeacherProfile from '@/components/teacher/TeacherProfile';
import TeacherStatsCards from '@/components/teacher/TeacherStatsCards';
import MyCoursesList from '@/components/teacher/MyCoursesList';
import StudentsList from '@/components/teacher/StudentsList';
import InternalGradeEntry from '@/components/teacher/InternalGradeEntry';
import AttendanceManagement from '@/components/teacher/AttendanceManagement';
import CourseAnalytics from '@/components/teacher/CourseAnalytics';
import Announcements from '@/components/teacher/Announcements';
import { Teacher, Course, Student, InternalGrade, Attendance, Announcement } from '@/components/teacher/types';

export default function TeacherDashboard() {
  const router = useRouter();
  


  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>('');
  

  // ========== STATE MANAGEMENT ==========
  const [internalGrades, setInternalGrades] = useState<InternalGrade[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ========== AUTH + DATA LOADING ==========
  useEffect(() => {
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    setLoading(true);
    setLoadError('');

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      setLoadError(userErr.message);
      setLoading(false);
      return;
    }

    const user = userRes.user;
    if (!user || user.user_metadata?.role !== 'teacher') {
      router.push('/login');
      return;
    }

    const t: Teacher = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || 'Teacher',
      teacher_id: user.user_metadata?.teacher_id || '',
      department: user.user_metadata?.department_name || user.user_metadata?.department || '',
      department_code: user.user_metadata?.department_code || '',
      department_id: user.user_metadata?.department_id || ''
    };
    setTeacher(t);

    // Load courses assigned to this teacher
    const { data: courseRows, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', user.id)
      .order('course_code');

    if (courseErr) {
      setLoadError(courseErr.message);
      setLoading(false);
      return;
    }

    setCourses((courseRows || []) as Course[]);

    // Load all registered students for teacher's department
    const deptId = t.department_id || (courseRows && courseRows[0]?.department_id) || '';
    if (deptId) {
      const { data: studentRows, error: studentErr } = await supabase
        .from('authorized_students')
        .select('*')
        .eq('department_id', deptId)
        .eq('status', 'registered')
        .order('student_id');

      if (studentErr) {
        setLoadError(studentErr.message);
        setLoading(false);
        return;
      }

      setStudents((studentRows || []) as Student[]);
    }

    // Load internal grades
    if (courseRows && courseRows.length > 0) {
      const courseIds = courseRows.map(c => c.id);
      const { data: gradesData } = await supabase
        .from('internal_grades')
        .select('*')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false });

      if (gradesData) {
        setInternalGrades(gradesData as InternalGrade[]);
      }
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedStudent(null);
  };

  // ========== HELPER FUNCTIONS ==========
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ========== HANDLER: Update Marks Breakdown ==========
  const handleUpdateMarksBreakdown = async (
    courseId: string,
    breakdown: {
      attendance: number;
      internal: number;
      class_performance: number;
      presentation: number;
      mini_project: number;
      assignment: number;
    }
  ) => {
    const { error } = await supabase
      .from('courses')
      .update({
        teacher_marks_breakdown: breakdown
      })
      .eq('id', courseId);

    if (error) {
      alert('Error saving marks breakdown: ' + error.message);
      return;
    }

    // Update local state
    setCourses(prev => prev.map(c => 
      c.id === courseId 
        ? { ...c, teacher_marks_breakdown: breakdown }
        : c
    ));

    showSuccess('Marks breakdown saved successfully! ✓');
  };

  // ========== HANDLER: Save/Update Internal Grade ==========
  const handleSaveGrade = async (gradeData: {
    attendance?: number;
    internal?: number;
    class_performance?: number;
    presentation?: number;
    mini_project?: number;
    assignment?: number;
    total_marks: number;
    grade_letter: string;
    remarks?: string;
  }) => {
    if (!selectedStudent || !selectedCourse || !teacher) return;

    setSaving(true);

    const gradePayload = {
      student_user_id: selectedStudent.user_id,
      student_name: selectedStudent.name,
      student_id: selectedStudent.student_id,
      course_id: selectedCourse.id,
      course_name: selectedCourse.course_name,
      course_code: selectedCourse.course_code,
      semester: selectedCourse.semester,
      attendance: gradeData.attendance || 0,
      internal: gradeData.internal || 0,
      class_performance: gradeData.class_performance || 0,
      presentation: gradeData.presentation || 0,
      mini_project: gradeData.mini_project || 0,
      assignment: gradeData.assignment || 0,
      total_marks: gradeData.total_marks,
      grade_letter: gradeData.grade_letter,
      remarks: gradeData.remarks || '',
      entered_by: teacher.teacher_id
    };

    // Check if grade already exists
    const { data: existing } = await supabase
      .from('internal_grades')
      .select('*')
      .eq('student_user_id', selectedStudent.user_id)
      .eq('course_id', selectedCourse.id)
      .single();

    let error;
    if (existing) {
      // Update existing grade
      ({ error } = await supabase
        .from('internal_grades')
        .update({
          ...gradePayload,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id));

      if (!error) {
        setInternalGrades(prev => prev.map(g => 
          g.id === existing.id 
            ? { ...g, ...gradePayload, id: existing.id, created_at: existing.created_at, updated_at: new Date().toISOString() }
            : g
        ));
        showSuccess('Grade updated successfully! ✓');
      }
    } else {
      // Insert new grade
      const { data: newGrade, error: insertError } = await supabase
        .from('internal_grades')
        .insert([gradePayload])
        .select()
        .single();

      error = insertError;

      if (!error && newGrade) {
        setInternalGrades(prev => [...prev, newGrade as InternalGrade]);
        showSuccess('Grade saved successfully! ✓');
      }
    }

    if (error) {
      alert('Error saving grade: ' + error.message);
    }

    setSaving(false);
    setSelectedStudent(null);
  };

  type AttendanceInput = Omit<Attendance, 'id'>;

  // ========== HANDLER: Mark Attendance ==========
  const handleMarkAttendance = async (attendanceData: AttendanceInput[]) => {
  const { error } = await supabase
    .from('attendance')
    .upsert(attendanceData, {
      onConflict: 'student_user_id,course_id,date'
    });

  if (error) {
    alert('Error marking attendance: ' + error.message);
    return;
  }

  if (selectedCourse) {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('course_id', selectedCourse.id)
      .order('date', { ascending: false });

    if (data) {
      setAttendanceRecords(data as Attendance[]);
    }
  }

  showSuccess(`Attendance marked for ${attendanceData.length} students!`);

};


  type AnnouncementInput = Omit<Announcement, 'id' | 'teacher_id' | 'created_at'>;

  // ========== HANDLER: Create Announcement ==========
  const handleCreateAnnouncement = async (announcementData: AnnouncementInput) => {
    if (!teacher) return;

    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        ...announcementData,
        teacher_id: teacher.id
      }])
      .select()
      .single();

    if (error) {
      alert('Error creating announcement: ' + error.message);
      return;
    }

    if (data) {
      setAnnouncements([data as Announcement, ...announcements]);
      showSuccess('Announcement posted successfully! ✓');
    }
  };

  // ========== HANDLER: Delete Announcement ==========
  const handleDeleteAnnouncement = async (id: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting announcement: ' + error.message);
      return;
    }

    setAnnouncements(announcements.filter(a => a.id !== id));
    showSuccess('Announcement deleted! ✓');
  };

  // ========== COMPUTED VALUES ==========
  // Get students for selected course (filter by semester)
  const courseStudents = selectedCourse
    ? students.filter(s => s.current_semester === selectedCourse.semester)
    : [];

  // Get grades for selected course
  const courseGrades = selectedCourse
    ? internalGrades.filter(g => g.course_id === selectedCourse.id)
    : [];

  // Get existing grade for selected student & course
  const existingGrade = selectedStudent && selectedCourse
    ? internalGrades.find(g => 
        g.student_user_id === selectedStudent.user_id && 
        g.course_id === selectedCourse.id
      ) || null
    : null;

  // ========== LOADING & ERROR STATES ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <Alert className="bg-red-50 border-red-300">
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {loadError}
            </AlertDescription>
          </Alert>
          <Button onClick={() => void init()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertDescription>
            Please login as a teacher to view this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-work-sans">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Success Message */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-500 animate-in fade-in duration-300">
            <AlertDescription className="text-green-800 font-medium flex items-center gap-2">
              <span className="text-xl">✓</span>
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Header with Logout */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your courses and student assessments</p>
          </div>
          <Button 
            onClick={handleLogout} 
            className="tag hover:bg-orange-500"
          >
            Logout
          </Button>
        </div>

        {/* Teacher Profile Header */}
        <TeacherProfile teacher={teacher} />

        {/* Stats Cards */}
        <TeacherStatsCards 
          courses={courses}
          students={students}
          internalGrades={internalGrades}
        />

        {/* Main Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full bg-white border shadow-sm ">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              📋 Overview
            </TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              📝 Grades
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              📅 Attendance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">
              📢 Announcements
            </TabsTrigger>
          </TabsList>

          {/* ========== TAB: OVERVIEW ========== */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Courses List with Marks Configuration */}
              <MyCoursesList 
                courses={courses}
                onSelectCourse={handleSelectCourse}
                onUpdateMarksBreakdown={handleUpdateMarksBreakdown}
              />

              {/* Quick Info or Selected Course Students */}
              {selectedCourse ? (
                <StudentsList
                  students={courseStudents}
                  selectedCourse={selectedCourse}
                  onSelectStudent={setSelectedStudent}
                />
              ) : (
                <Card className="shadow-md login">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>👥</span> Quick Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-700 font-medium">Total Students</div>
                        <div className="text-3xl font-bold text-blue-900 mt-1">{students.length}</div>
                        <div className="text-xs text-blue-600 mt-1">Across all courses</div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 font-medium">Grades Entered</div>
                        <div className="text-3xl font-bold text-green-900 mt-1">{internalGrades.length}</div>
                        <div className="text-xs text-green-600 mt-1">Student assessments completed</div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <div className="text-sm text-purple-700 font-medium">Attendance Records</div>
                        <div className="text-3xl font-bold text-purple-900 mt-1">{attendanceRecords.length}</div>
                        <div className="text-xs text-purple-600 mt-1">Attendance entries logged</div>
                      </div>
                      
                      {courses.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            💡 <strong>Tip:</strong> Select a course to manage students and enter grades
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ========== TAB: GRADES ========== */}
          <TabsContent value="grades">
            {!selectedCourse ? (
              <Alert className="shadow-md">
                <AlertDescription className="flex items-center gap-2">
                  <span className="text-2xl">👈</span>
                  <span>Please select a course from the <strong>Overview</strong> tab first to enter grades</span>
                </AlertDescription>
              </Alert>
            ) : courseStudents.length === 0 ? (
              <Alert className="shadow-md bg-orange-50 border-orange-300">
                <AlertDescription className="text-orange-800">
                  <strong>No students found.</strong> There are no registered students for this course's semester.
                </AlertDescription>
              </Alert>
            ) : selectedStudent ? (
              <InternalGradeEntry
                student={selectedStudent}
                course={selectedCourse}
                existingGrade={existingGrade}
                onSave={handleSaveGrade}
                saving={saving}
              />
            ) : (
              <StudentsList
                students={courseStudents}
                selectedCourse={selectedCourse}
                onSelectStudent={setSelectedStudent}
              />
            )}
          </TabsContent>

          {/* ========== TAB: ATTENDANCE ========== */}
          <TabsContent value="attendance">
            {!selectedCourse ? (
              <Alert className="shadow-md">
                <AlertDescription className="flex items-center gap-2">
                  <span className="text-2xl">👈</span>
                  <span>Please select a course from the <strong>Overview</strong> tab first to mark attendance</span>
                </AlertDescription>
              </Alert>
            ) : (
              <AttendanceManagement
                students={courseStudents}
                course={selectedCourse}
                onMarkAttendance={handleMarkAttendance}
              />
            )}
          </TabsContent>

          {/* ========== TAB: ANALYTICS ========== */}
          <TabsContent value="analytics">
            {!selectedCourse ? (
              <Alert className="shadow-md">
                <AlertDescription className="flex items-center gap-2">
                  <span className="text-2xl">👈</span>
                  <span>Please select a course from the <strong>Overview</strong> tab first to view analytics</span>
                </AlertDescription>
              </Alert>
            ) : (
              <CourseAnalytics
                internalGrades={courseGrades}
                courseName={selectedCourse.course_name}
              />
            )}
          </TabsContent>

          {/* ========== TAB: ANNOUNCEMENTS ========== */}
          <TabsContent value="announcements">
            <Announcements
              announcements={announcements}
              courses={courses}
              onCreateAnnouncement={handleCreateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}