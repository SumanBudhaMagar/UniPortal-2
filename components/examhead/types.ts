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

export interface Course {
  id: string;
  course_name: string;
  course_code: string;
  semester: number;
  department_id: string;
  credits: number;
}

export interface Grade {
  id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  semester: number;
  grade_letter: string;
  gpa: number;
  status: string;
  exam_type: string;
  created_at: string;
  student_user_id?: string;
  marks : number;
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