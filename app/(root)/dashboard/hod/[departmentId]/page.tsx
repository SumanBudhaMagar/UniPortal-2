'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Type definitions
interface HOD {
  id: string;
  email: string;
  name: string;
  department_id: string;
  department_name: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
  status: string;
  created_at: string;
}

interface Teacher {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    teacher_id: string;
  };
}

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  semester: number;
  year: number;
  credits: number;
  teacher_id: string | null;
  teacher_name: string | null;
  created_at: string;
}

export default function HODDashboard() {
  const router = useRouter();
  const params = useParams();
  const [hod, setHod] = useState<HOD | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', studentId: '' });
  const [newTeacher, setNewTeacher] = useState({ email: '' });
  const [newCourse, setNewCourse] = useState({ 
    courseName: '', 
    courseCode: '', 
    semester: '1', 
    year: '1',
    credits: '3', 
    teacherId: '' 
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    checkHODAndLoadData();
  }, []);

  const checkHODAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'hod') {
      router.push('/login');
      return;
    }

    // Check if HOD is authorized for this department
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

    // Load department details
    const { data: deptData } = await supabase
      .from('departments')
      .select('*')
      .eq('id', params.departmentId)
      .single();

    setDepartment(deptData);

    // Load data
    await loadStudents();
    await loadTeachers();
    await loadCourses();
    setLoading(false);
  };

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from('authorized_students')
      .select('*')
      .eq('department_id', params.departmentId)
      .order('created_at', { ascending: false });

    if (data) setStudents(data);
  };

  const loadTeachers = async () => {
    // Get all users with role=teacher and department_id matching
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (data) {
      const deptTeachers = data.users.filter(user => 
        user.user_metadata?.role === 'teacher' && 
        user.user_metadata?.department_id === params.departmentId
      );
      setTeachers(deptTeachers as any);
    }
  };

  const loadCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', params.departmentId)
      .order('semester', { ascending: true })
      .order('course_code');

    if (data) setCourses(data);
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate email
    if (!newStudent.email.endsWith('@student.ku.edu.np')) {
      alert('Student email must end with @student.ku.edu.np');
      return;
    }

    const { error } = await supabase
      .from('authorized_students')
      .insert([{
        name: newStudent.name,
        email: newStudent.email,
        student_id: newStudent.studentId,
        department_id: params.departmentId,
        status: 'pending'
      }]);

    if (!error) {
      alert('Student added successfully! They can now register with this email.');
      setNewStudent({ name: '', email: '', studentId: '' });
      setShowAddStudent(false);
      loadStudents();
    } else {
      if (error.code === '23505') {
        alert('This email is already registered for this department.');
      } else {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleBulkUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    setUploadProgress('Reading file...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      if (dataLines.length === 0) {
        alert('CSV file is empty');
        setUploadProgress('');
        return;
      }

      setUploadProgress(`Processing ${dataLines.length} students...`);

      const studentsToAdd = [];
      let errors = [];

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim();
        if (!line) continue;

        const [name, email, studentId] = line.split(',').map(s => s.trim());

        if (!name || !email || !studentId) {
          errors.push(`Row ${i + 2}: Missing data`);
          continue;
        }

        if (!email.endsWith('@student.ku.edu.np')) {
          errors.push(`Row ${i + 2}: Invalid email format - ${email}`);
          continue;
        }

        studentsToAdd.push({
          name,
          email,
          student_id: studentId,
          department_id: params.departmentId,
          status: 'pending'
        });
      }

      if (studentsToAdd.length === 0) {
        alert('No valid students to add');
        setUploadProgress('');
        return;
      }

      // Insert all students
      const { data, error } = await supabase
        .from('authorized_students')
        .insert(studentsToAdd);

      if (error) {
        alert('Error uploading students: ' + error.message);
      } else {
        let message = `Successfully added ${studentsToAdd.length} students!`;
        if (errors.length > 0) {
          message += `\n\nErrors:\n${errors.join('\n')}`;
        }
        alert(message);
        setCsvFile(null);
        setShowBulkUpload(false);
        loadStudents();
      }
      
      setUploadProgress('');
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
      alert('Student removed!');
      loadStudents();
    }
  };

  const handleAddTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if teacher exists in auth.users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      alert('Error checking teacher: ' + error.message);
      return;
    }

    const teacher = users.find(u => u.email === newTeacher.email && u.user_metadata?.role === 'teacher');

    if (!teacher) {
      alert('No teacher found with this email. They must register as a teacher first.');
      return;
    }

    // Check if already in department
    if (teacher.user_metadata?.department_id === params.departmentId) {
      alert('This teacher is already in your department.');
      return;
    }

    // Update teacher's department
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      teacher.id,
      {
        user_metadata: {
          ...teacher.user_metadata,
          department_id: params.departmentId,
          department_name: department?.name,
          department_code: department?.code
        }
      }
    );

    if (!updateError) {
      alert('Teacher added to department successfully!');
      setNewTeacher({ email: '' });
      setShowAddTeacher(false);
      loadTeachers();
    } else {
      alert('Error: ' + updateError.message);
    }
  };

  const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get teacher name
    const teacher = teachers.find(t => t.id === newCourse.teacherId);
    
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
        teacher_name: teacher?.user_metadata?.name || null,
        created_by: hod?.id
      }]);

    if (!error) {
      alert('Course added successfully!');
      setNewCourse({ courseName: '', courseCode: '', semester: '1', year: '1', credits: '3', teacherId: '' });
      setShowAddCourse(false);
      loadCourses();
    } else {
      if (error.code === '23505') {
        alert('A course with this code already exists.');
      } else {
        alert('Error: ' + error.message);
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
      alert('Course deleted!');
      loadCourses();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const downloadCSVTemplate = () => {
    const template = 'Name,Email,Student ID\nJohn Doe,john@student.ku.edu.np,CS-2024-001\nJane Smith,jane@student.ku.edu.np,CS-2024-002';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    a.click();
  };

  const getSemesterName = (semester: number) => {
    const year = Math.ceil(semester / 2);
    const sem = semester % 2 === 0 ? 2 : 1;
    return `Year ${year} - Sem ${sem}`;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">👔 HOD Dashboard</h1>
            <p className="text-purple-100">{department?.name} Department</p>
            <p className="text-sm text-purple-200">Welcome, {hod?.name}</p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{students.length}</div>
              <div className="text-blue-100">Total Students</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">
                {students.filter(s => s.status === 'registered').length}
              </div>
              <div className="text-green-100">Registered Students</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{teachers.length}</div>
              <div className="text-orange-100">Teachers</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{courses.length}</div>
              <div className="text-purple-100">Total Courses</div>
            </CardContent>
          </Card>
        </div>

        {/* Students Management */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>🎓 Students Management</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowBulkUpload(!showBulkUpload)}
                className="bg-green-600 hover:bg-green-700"
              >
                📁 Bulk Upload
              </Button>
              <Button 
                onClick={() => setShowAddStudent(!showAddStudent)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + Add Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bulk Upload Form */}
            {showBulkUpload && (
              <form onSubmit={handleBulkUpload} className="mb-6 p-4 bg-green-50 rounded-lg space-y-4">
                <div>
                  <Label>Upload CSV File</Label>
                  <p className="text-xs text-gray-600 mb-2">
                    Format: Name, Email, Student ID (one student per line)
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    required
                  />
                  <button
                    type="button"
                    onClick={downloadCSVTemplate}
                    className="text-xs text-blue-600 hover:underline mt-1"
                  >
                    Download CSV Template
                  </button>
                </div>
                {uploadProgress && (
                  <div className="text-sm text-blue-600">{uploadProgress}</div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Upload Students
                  </Button>
                  <Button type="button" onClick={() => setShowBulkUpload(false)} className="bg-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Manual Add Form */}
            {showAddStudent && (
              <form onSubmit={handleAddStudent} className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Student Name</Label>
                    <Input
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label>Student Email</Label>
                    <Input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      placeholder="john@student.ku.edu.np"
                      required
                    />
                  </div>
                  <div>
                    <Label>Student ID</Label>
                    <Input
                      value={newStudent.studentId}
                      onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                      placeholder="CS-2024-001"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Add Student
                  </Button>
                  <Button type="button" onClick={() => setShowAddStudent(false)} className="bg-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Students List */}
            <div className="space-y-3">
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students added yet. Add students manually or upload CSV.
                </div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {student.name}
                        {student.status === 'registered' ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ✓ Registered
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                      <div className="text-xs text-gray-500">ID: {student.student_id}</div>
                    </div>
                    <Button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teachers Management */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>👨‍🏫 Teachers Management</CardTitle>
            <Button 
              onClick={() => setShowAddTeacher(!showAddTeacher)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + Add Teacher
            </Button>
          </CardHeader>
          <CardContent>
            {showAddTeacher && (
              <form onSubmit={handleAddTeacher} className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                <div>
                  <Label>Teacher Email (must be registered)</Label>
                  <Input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({email: e.target.value})}
                    placeholder="teacher@ku.edu.np"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Note: Teacher must be registered in the system first
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Add Teacher
                  </Button>
                  <Button type="button" onClick={() => setShowAddTeacher(false)} className="bg-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {teachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No teachers in this department yet.
                </div>
              ) : (
                teachers.map((teacher) => (
                  <div key={teacher.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div>
                      <div className="font-semibold">{teacher.user_metadata?.name}</div>
                      <div className="text-sm text-gray-600">{teacher.email}</div>
                      <div className="text-xs text-gray-500">ID: {teacher.user_metadata?.teacher_id}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses Management */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>📚 Courses Management</CardTitle>
            <Button 
              onClick={() => setShowAddCourse(!showAddCourse)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              + Add Course
            </Button>
          </CardHeader>
          <CardContent>
            {showAddCourse && (
              <form onSubmit={handleAddCourse} className="mb-6 p-4 bg-purple-50 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Course Name</Label>
                    <Input
                      value={newCourse.courseName}
                      onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                      placeholder="Data Structures"
                      required
                    />
                  </div>
                  <div>
                    <Label>Course Code</Label>
                    <Input
                      value={newCourse.courseCode}
                      onChange={(e) => setNewCourse({...newCourse, courseCode: e.target.value})}
                      placeholder="CS-201"
                      required
                    />
                  </div>
                  <div>
                    <Label>Year (1-4)</Label>
                    <select
                      value={newCourse.year}
                      onChange={(e) => {
                        const year = e.target.value;
                        setNewCourse({...newCourse, year});
                        // Auto-adjust semester based on year
                        const minSem = (parseInt(year) - 1) * 2 + 1;
                        if (parseInt(newCourse.semester) < minSem || parseInt(newCourse.semester) > minSem + 1) {
                          setNewCourse({...newCourse, year, semester: minSem.toString()});
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                  <div>
                    <Label>Semester (1-8)</Label>
                    <select
                      value={newCourse.semester}
                      onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="1">Semester 1 (Year 1)</option>
                      <option value="2">Semester 2 (Year 1)</option>
                      <option value="3">Semester 3 (Year 2)</option>
                      <option value="4">Semester 4 (Year 2)</option>
                      <option value="5">Semester 5 (Year 3)</option>
                      <option value="6">Semester 6 (Year 3)</option>
                      <option value="7">Semester 7 (Year 4)</option>
                      <option value="8">Semester 8 (Year 4)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Credits</Label>
                    <Input
                      type="number"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                      placeholder="3"
                      min="1"
                      max="6"
                      required
                    />
                  </div>
                  <div>
                    <Label>Assign Teacher (Optional)</Label>
                    <select
                      value={newCourse.teacherId}
                      onChange={(e) => setNewCourse({...newCourse, teacherId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">No teacher assigned</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.user_metadata?.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Add Course
                  </Button>
                  <Button type="button" onClick={() => setShowAddCourse(false)} className="bg-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {courses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No courses created yet. Add courses for your department.
                </div>
              ) : (
                // Group courses by semester
                [...Array(8)].map((_, idx) => {
                  const sem = idx + 1;
                  const semCourses = courses.filter(c => c.semester === sem);
                  if (semCourses.length === 0) return null;
                  
                  return (
                    <div key={sem}>
                      <h3 className="font-semibold text-lg mb-2 text-gray-700">
                        {getSemesterName(sem)}
                      </h3>
                      <div className="space-y-2">
                        {semCourses.map((course) => (
                          <div key={course.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div className="flex-1">
                              <div className="font-semibold">{course.course_name}</div>
                              <div className="text-sm text-gray-600">
                                Code: {course.course_code} | Credits: {course.credits}
                                {course.teacher_name && ` | Teacher: ${course.teacher_name}`}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}