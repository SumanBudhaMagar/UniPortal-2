// components/teacher/types.ts

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
  department_id: string;
  semester: number;
  year: number;
  credits: number;
  teacher_id: string | null;
  teacher_name?: string;
  created_by: string;
  created_at: string;
  teacher_marks_total?: number;
  exam_marks_total?: number;
  teacher_marks_breakdown?: {
    attendance: number;
    internal: number;
    class_performance: number;
    presentation: number;
    mini_project: number;
    assignment: number;
  };
}

export interface Student {
  user_id: string;
  name: string;
  email: string;
  student_id: string;
  department_id: string;
  current_semester: number;
  status: string;
  created_at: string;
}

export interface InternalGrade {
  id: string;
  student_user_id: string;
  student_name: string;
  student_id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  semester: number;
  
  // Marks breakdown
  attendance?: number;
  internal?: number;
  class_performance?: number;
  presentation?: number;
  mini_project?: number;
  assignment?: number;
  
  // Legacy fields (for backward compatibility)
  assignment_marks?: number;
  midterm_marks?: number;
  attendance_marks?: number;
  quiz_marks?: number;
  
  total_marks: number;
  grade_letter: string;
  remarks?: string;
  
  entered_by: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_user_id: string;
  student_name: string;
  course_id: string;
  course_code: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  marked_by: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  teacher_id: string;
  title: string;
  message: string;
  course_id?: string;
  course_name?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}