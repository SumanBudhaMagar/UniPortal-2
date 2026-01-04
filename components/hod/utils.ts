// FILE 2: components/hod/utils.ts
// ============================================

export const getSemesterName = (semester: number): string => {
  const year = Math.ceil(semester / 2);
  const sem = semester % 2 === 0 ? 2 : 1;
  return `Year ${year} - Sem ${sem}`;
};

export const downloadCSVTemplate = (): void => {
  const template = 'Name,Email,Student ID,Semester\nJohn Doe,john@student.ku.edu.np,CS-2024-001,1\nJane Smith,jane@student.ku.edu.np,CS-2024-002,1';
  const blob = new Blob([template], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'student_upload_template.csv';
  a.click();
};

export const validateStudentEmail = (email: string): boolean => {
  return email.endsWith('@student.ku.edu.np');
};

