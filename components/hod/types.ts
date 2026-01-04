// components/hod/types.ts

export interface HOD {
  id: string;
  email: string;
  name: string;
  department_id: string;
  department_name: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
  status: string;
  created_at: string;
  current_semester?: number; // ADD THIS
  year?: number; // ADD THIS
}

export interface Teacher {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    teacher_id: string;
  };
}

export interface Course {
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

export interface NewStudent {
  name: string;
  email: string;
  studentId: string;
  semester: string; // ADD THIS
}

export interface NewTeacher {
  email: string;
}

export interface NewCourse {
  courseName: string;
  courseCode: string;
  semester: string;
  year: string;
  credits: string;
  teacherId: string;
}