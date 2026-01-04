// ============================================
// FILE 2: components/student/utils.ts
// ============================================

export const getSemesterName = (semester: number): string => {
  const year = Math.ceil(semester / 2);
  const sem = semester % 2 === 0 ? 2 : 1;
  return `Year ${year} - Semester ${sem}`;
};

export const getGradeColor = (grade: string): string => {
  if (grade === 'A' || grade === 'A-') return 'text-green-600 bg-green-50';
  if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'text-blue-600 bg-blue-50';
  if (grade === 'C+' || grade === 'C') return 'text-yellow-600 bg-yellow-50';
  if (grade === 'D') return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

export const calculateCGPA = (grades: { gpa: number }[]): number => {
  if (grades.length === 0) return 0;
  const totalGPA = grades.reduce((sum, grade) => sum + parseFloat(grade.gpa.toString()), 0);
  const avgGPA = totalGPA / grades.length;
  return parseFloat(avgGPA.toFixed(2));
};
