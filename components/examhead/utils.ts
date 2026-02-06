// components/examhead/utils.ts

/**
 * Converts semester number (1-8) to readable name
 * Example: 1 -> "Year 1 - Semester 1", 5 -> "Year 3 - Semester 1"
 */


/**
 * Gets grade info from grade letter
 */
export const getGradeInfo = (gradeLetter: string, gradeScale: { letter: string; gpa: number }[]) => {
  return gradeScale.find(g => g.letter === gradeLetter);
};

/**
 * Determines if a grade is passing (GPA >= 1.0)
 */
export const isPassingGrade = (gpa: number): boolean => {
  return gpa >= 1.0;
};

/**
 * Calculates next semester number
 */
export const getNextSemester = (currentSemester: number): number => {
  return Math.min(currentSemester + 1, 8);
};

/**
 * Gets year from semester
 */
export const getYearFromSemester = (semester: number): number => {
  return Math.ceil(semester / 2);
};
// components/examhead/utils.ts

export const getSemesterName = (semester: number): string => {
  const year = Math.ceil(semester / 2);
  const semInYear = semester % 2 === 0 ? 2 : 1;
  return `Semester ${semester} (Year ${year}, Sem ${semInYear})`;
};

export const getGradeLetter = (percentage: number): string => {
  
  if (percentage >= 80) return 'A';
  if (percentage > 80) return 'A-';
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