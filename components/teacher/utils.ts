

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

// components/teacher/utils.ts

export const getSemesterName = (semester: number): string => {
  const year = Math.ceil(semester / 2);
  const semInYear = semester % 2 === 0 ? 2 : 1;
  return `Semester ${semester} (Year ${year}, Sem ${semInYear})`;
};

export const getGradeLetter = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  return 'F';
};

export const getGPAFromGrade = (grade: string): number => {
  const gradeMap: Record<string, number> = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0
  };
  return gradeMap[grade] || 0.0;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};