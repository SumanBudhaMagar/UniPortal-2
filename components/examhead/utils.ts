// components/examhead/utils.ts

/**
 * Converts semester number (1-8) to readable name
 * Example: 1 -> "Year 1 - Semester 1", 5 -> "Year 3 - Semester 1"
 */
export const getSemesterName = (semester: number): string => {
  const year = Math.ceil(semester / 2);
  const sem = semester % 2 === 0 ? 2 : 1;
  return `Year ${year} - Semester ${sem}`;
};

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