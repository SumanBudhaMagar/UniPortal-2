// FILE 1: components/teacher/types.ts
// ============================================

export interface Teacher {
  id: string;
  email: string;
  name: string;
  teacher_id: string;
  department: string;
  department_code: string;
  department_id: string;
}

export interface Course {
  id: string;
  course_name: string;
  course_code: string;
  semester: number;
  year: number;
  credits: number;
  department_id: string;
}

export interface Student {
  user_id: string;
  name: string;
  email: string;
  student_id: string;
  current_semester: number;
  year: number;
  department?: {
    name: string;
    code: string;
  };
  departments?: {
    name: string;
    code: string;
  };
}

export interface InternalGrade {
  id: string;
  student_user_id: string;
  student_name: string;
  student_id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  assignment_marks?: number;
  midterm_marks?: number;
  attendance_marks?: number;
  quiz_marks?: number;
  total_marks: number;
  grade_letter: string;
  remarks?: string;
  semester: number;
  entered_by: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_user_id: string;
  student_name: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  course_id?: string;
  teacher_id: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface NewInternalGrade {
  assignment_marks?: number;
  midterm_marks?: number;
  attendance_marks?: number;
  quiz_marks?: number;
  remarks?: string;
}
