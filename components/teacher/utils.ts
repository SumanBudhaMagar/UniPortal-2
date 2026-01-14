export const getSemesterName = (semester: number): string => {
  const year = Math.ceil(semester / 2);
  const sem = semester % 2 === 0 ? 2 : 1;
  return `Year ${year} - Semester ${sem}`;
};

export const calculateInternalGrade = (marks: {
  assignment?: number;
  midterm?: number;
  attendance?: number;
  quiz?: number;
}): { total: number; grade: string } => {
  const assignment = marks.assignment || 0;
  const midterm = marks.midterm || 0;
  const attendance = marks.attendance || 0;
  const quiz = marks.quiz || 0;
  
  const total = assignment + midterm + attendance + quiz;
  
  let grade = 'F';
  if (total >= 90) grade = 'A';
  else if (total >= 85) grade = 'A-';
  else if (total >= 80) grade = 'B+';
  else if (total >= 75) grade = 'B';
  else if (total >= 70) grade = 'B-';
  else if (total >= 65) grade = 'C+';
  else if (total >= 60) grade = 'C';
  else if (total >= 50) grade = 'D';
  
  return { total, grade };
};

export const getAttendancePercentage = (
  present: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const getGradeColor = (grade: string): string => {
  if (grade === 'A' || grade === 'A-') return 'text-green-600 bg-green-50';
  if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'text-blue-600 bg-blue-50';
  if (grade === 'C+' || grade === 'C') return 'text-yellow-600 bg-yellow-50';
  if (grade === 'D') return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};
