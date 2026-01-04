// components/student/types.ts

export interface Student {
  id: string;
  email: string;
  name: string;
  student_id: string;
  department: string;
  department_code: string;
  current_semester: number;
  year: number;
}

export interface Course {
  id: string;
  course_name: string;
  course_code: string;
  semester: number;
  year: number;
  credits: number;
  teacher_name: string;
}

export interface Grade {
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