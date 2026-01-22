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
  name: string | null;
  teacher_id: string | null;
  user_id: string | null;
  department_id: string;
  status: string; // 'pending' | 'registered'
  created_at: string;
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

  // Marking scheme (configured by HOD)
  teacher_marks_total?: number; // e.g. 25 or 50
  exam_marks_total?: number; // e.g. 75 or 50
  teacher_marks_breakdown?: {
    attendance?: number;
    internal?: number;
    class_performance?: number;
    presentation?: number;
    mini_project?: number;
    assignment?: number;
  };
}

export interface NewStudent {
  name: string;
  email: string;
  studentId: string;
  semester: string; // ADD THIS
}

export interface NewTeacher {
  email: string;
  teacherId: string;
}

export interface NewCourse {
  courseName: string;
  courseCode: string;
  semester: string;
  year: string;
  credits: string;
  teacherId: string;
}