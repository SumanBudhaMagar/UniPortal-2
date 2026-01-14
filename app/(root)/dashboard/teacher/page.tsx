'use client';
import { useState } from 'react';
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
  //tests
  const [teacher] = useState<Teacher>({
    id: '123456',
    email: 'Ram.shah@ku.edu.np',
    name: 'Dr. Ram Shah',
    teacher_id: 'T2024001',
    department: 'Computer Science',
    department_code: 'CS',
    department_id: 'dept-cs-01'
  });

  const [courses] = useState<Course[]>([
    { id: '1', course_name: 'Data Structures', course_code: 'CS201', semester: 3, year: 2024, credits: 3, department_id: 'dept-cs-01' },
    { id: '2', course_name: 'Algorithms', course_code: 'CS301', semester: 5, year: 2024, credits: 4, department_id: 'dept-cs-01' },
    { id: '3', course_name: 'Database Systems', course_code: 'CS202', semester: 4, year: 2024, credits: 3, department_id: 'dept-cs-01' }
  ]);

  const [students] = useState<Student[]>([
    { user_id: '1', name: 'Alice Johnson', email: 'alice@university.edu', student_id: 'S2023001', current_semester: 3, year: 2024 },
    { user_id: '2', name: 'Bob Smith', email: 'bob@university.edu', student_id: 'S2023002', current_semester: 3, year: 2024 },
    { user_id: '3', name: 'Carol White', email: 'carol@university.edu', student_id: 'S2023003', current_semester: 3, year: 2024 },
    { user_id: '4', name: 'David Brown', email: 'david@university.edu', student_id: 'S2022001', current_semester: 5, year: 2024 },
    { user_id: '5', name: 'Emma Davis', email: 'emma@university.edu', student_id: 'S2022002', current_semester: 5, year: 2024 }
  ]);

  // ========== STATE MANAGEMENT ==========
  const [internalGrades, setInternalGrades] = useState<InternalGrade[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ========== HELPER FUNCTIONS ==========
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ========== HANDLER: Save/Update Internal Grade ==========
  const handleSaveGrade = async (gradeData: any) => {
    if (!selectedStudent || !selectedCourse) return;

    setSaving(true);
    
    const newGrade: InternalGrade = {
      id: Date.now().toString(),
      student_user_id: selectedStudent.user_id,
      student_name: selectedStudent.name,
      student_id: selectedStudent.student_id,
      course_id: selectedCourse.id,
      course_name: selectedCourse.course_name,
      course_code: selectedCourse.course_code,
      semester: selectedCourse.semester,
      entered_by: teacher.teacher_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...gradeData
    };

    // Check if grade already exists for update
    const existingIndex = internalGrades.findIndex(
      g => g.student_user_id === selectedStudent.user_id && g.course_id === selectedCourse.id
    );

    if (existingIndex >= 0) {
      const updated = [...internalGrades];
      updated[existingIndex] = newGrade;
      setInternalGrades(updated);
      showSuccess('Grade updated successfully! ✓');
    } else {
      setInternalGrades([...internalGrades, newGrade]);
      showSuccess('Grade saved successfully! ✓');
    }

    setSaving(false);
    setSelectedStudent(null);
  };

  // ========== HANDLER: Mark Attendance ==========
  const handleMarkAttendance = async (attendanceData: any[]) => {
    const newRecords: Attendance[] = attendanceData.map(record => ({
      id: Date.now().toString() + Math.random(),
      ...record
    }));

    setAttendanceRecords([...attendanceRecords, ...newRecords]);
    showSuccess(`Attendance marked for ${attendanceData.length} students! ✓`);
  };

  // ========== HANDLER: Create Announcement ==========
  const handleCreateAnnouncement = async (announcementData: any) => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      teacher_id: teacher.id,
      created_at: new Date().toISOString(),
      ...announcementData
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    showSuccess('Announcement posted successfully! ✓');
  };

  // ========== HANDLER: Delete Announcement ==========
  const handleDeleteAnnouncement = async (id: string) => {
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

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Success Message */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-500">
            <AlertDescription className="text-green-800 font-medium">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Teacher Profile Header */}
        <TeacherProfile teacher={teacher} />

        {/* Stats Cards */}
        <TeacherStatsCards 
          courses={courses}
          students={students}
          internalGrades={internalGrades}
        />

        {/* Main Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">📋 Overview</TabsTrigger>
            <TabsTrigger value="grades">📝 Grades</TabsTrigger>
            <TabsTrigger value="attendance">📅 Attendance</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="announcements">📢 Announcements</TabsTrigger>
          </TabsList>

          {/* ========== TAB: OVERVIEW ========== */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Courses List */}
              <MyCoursesList 
                courses={courses}
                onSelectCourse={setSelectedCourse}
              />

              {/* Quick Info or Selected Course Students */}
              {selectedCourse ? (
                <StudentsList
                  students={courseStudents}
                  selectedCourse={selectedCourse}
                  onSelectStudent={setSelectedStudent}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>👥 Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">Total Students</div>
                        <div className="text-2xl font-bold text-blue-700">{students.length}</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">Grades Entered</div>
                        <div className="text-2xl font-bold text-green-700">{internalGrades.length}</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600">Attendance Records</div>
                        <div className="text-2xl font-bold text-purple-700">{attendanceRecords.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ========== TAB: GRADES ========== */}
          <TabsContent value="grades">
            {!selectedCourse ? (
              <Alert>
                <AlertDescription>
                  Please select a course from the Overview tab first
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
            <AttendanceManagement
              students={courseStudents}
              course={selectedCourse}
              onMarkAttendance={handleMarkAttendance}
            />
          </TabsContent>

          {/* ========== TAB: ANALYTICS ========== */}
          <TabsContent value="analytics">
            {!selectedCourse ? (
              <Alert>
                <AlertDescription>
                  Please select a course from the Overview tab first
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