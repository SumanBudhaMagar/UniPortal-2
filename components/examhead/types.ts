// components/examhead/types.ts

export interface ExamHead {
  id: string;
  email: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Student {
  user_id: string;
  name: string;
  email: string;
  student_id: string;
  department_id: string;
  current_semester: number;
  department?: {
    name: string;
    code: string;
  };
  departments?: {
    name: string;
    code: string;
  };
}

// Add to Course interface
export interface Course {
  id: string;
  course_name: string;
  course_code: string;
  department_id: string;
  semester: number;
  year: number;
  credits: number;
  teacher_id?: string;
  teacher_name?: string;
  created_by?: string;
  created_at?: string;
  // Add these new properties:
  teacher_marks_total?: number;
  exam_marks_total?: number;
  teacher_marks_breakdown?: {
    attendance?: number;
    internal?: number;
    class_performance?: number;
    presentation?: number;
    mini_project?: number;
    assignment?: number;
  };
}

// Add to Grade interface
export interface Grade {
  id: string;
  student_user_id: string;
  student_email: string;
  student_name: string;
  student_id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  semester: number;
  grade_letter: string;
  gpa: number;
  status: string;
  exam_type: string;
  entered_by?: string;
  created_at?: string;
  // Add these new properties:
  teacher_marks?: number;
  exam_marks?: number;
  total_marks?: number;
  marks?: number; // Keep for backward compatibility
}
export interface GradeScale {
  letter: string;
  gpa: number;
}

export const GRADE_SCALE: GradeScale[] = [
  { letter: 'A', gpa: 4.0 },
  { letter: 'A-', gpa: 3.7 },
  { letter: 'B+', gpa: 3.3 },
  { letter: 'B', gpa: 3.0 },
  { letter: 'B-', gpa: 2.7 },
  { letter: 'C+', gpa: 2.3 },
  { letter: 'C', gpa: 2.0 },
  { letter: 'D', gpa: 1.0 },
  { letter: 'F', gpa: 0.0 },
];