// components/student/AcademicResults.tsx
'use client';
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grade } from './types';
import { getSemesterName } from './utils';

interface AcademicResultsProps {
  grades: Grade[];
}

export default function AcademicResults({ grades }: AcademicResultsProps) {
  const [showRecord, setShowRecord] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  
  const uniqueSemesters = [...new Set(grades.map(g => g.semester))].sort((a, b) => a - b);
  const overallGPA = grades.length > 0 
    ? (grades.reduce((sum, g) => sum + parseFloat(g.gpa.toString()), 0) / grades.length).toFixed(2)
    : '0.00';

  // Filter grades based on selected semester
  const filteredGrades = selectedSemester === 'all' 
    ? grades 
    : grades.filter(g => g.semester === selectedSemester);
  
  const displaySemesters = selectedSemester === 'all'
    ? uniqueSemesters
    : [selectedSemester as number];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>📊 Academic Record</CardTitle>
          <div className="flex gap-3">
            {showRecord && (
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-4 py-2 border rounded-md bg-white text-sm font-medium"
              >
                <option value="all">All Semesters</option>
                {uniqueSemesters.map(sem => (
                  <option key={sem} value={sem}>
                    {getSemesterName(sem)}
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={() => setShowRecord(!showRecord)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {showRecord ? '📋 Hide Record' : '📋 View Academic Record'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!showRecord ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg mb-2">Click "View Academic Record" to see your results</div>
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No results published yet.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Academic Record Header */}
            <div className="text-center border-b-2 border-gray-300 pb-6">
              <div className="text-2xl font-bold text-gray-800 mb-2">ACADEMIC RECORD</div>
              <div className="text-sm text-gray-600">
                {selectedSemester === 'all' 
                  ? 'Complete Academic Performance Report' 
                  : `${getSemesterName(selectedSemester as number)} Results`}
              </div>
            </div>

            {/* Results by Semester */}
            {displaySemesters.map(semester => {
              const semesterGrades = filteredGrades.filter(g => g.semester === semester);
              if (semesterGrades.length === 0) return null;
              
              const semesterGPA = (
                semesterGrades.reduce((sum, g) => sum + parseFloat(g.gpa.toString()), 0) / 
                semesterGrades.length
              ).toFixed(2);
              const totalCredits = semesterGrades.length * 3; // Assuming 3 credits per course

              return (
                <div key={semester} className="border rounded-lg overflow-hidden shadow-sm">
                  {/* Semester Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        {getSemesterName(semester)}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm opacity-90">Semester GPA</div>
                        <div className="text-2xl font-bold">{semesterGPA}</div>
                      </div>
                    </div>
                  </div>

                  {/* Grades Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course Number</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course Title</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Credit</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Grade Value</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Grade Points</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semesterGrades.map((grade, idx) => {
                          const credits = 3; // Assuming 3 credits per course
                          const gradePoints = parseFloat(grade.gpa.toString()) * credits;
                          
                          return (
                            <tr 
                              key={grade.id} 
                              className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                            >
                              <td className="px-4 py-3 text-sm font-medium border-t">{grade.course_code}</td>
                              <td className="px-4 py-3 text-sm border-t">
                                {grade.course_name}
                                {grade.exam_type === 'retake' && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    Retake
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-center border-t">{credits}</td>
                              <td className="px-4 py-3 text-center border-t">
                                <span className="font-bold text-lg text-blue-700">{grade.grade_letter}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-center border-t">{parseFloat(grade.gpa.toString()).toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm text-center font-semibold border-t">{gradePoints.toFixed(2)}</td>
                              <td className="px-4 py-3 text-center border-t">
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                  grade.status === 'passed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {grade.status === 'passed' ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Semester Total Row */}
                        <tr className="bg-blue-50 font-semibold border-t-2 border-blue-300">
                          <td className="px-4 py-3 text-sm" colSpan={2}>Total</td>
                          <td className="px-4 py-3 text-sm text-center">{totalCredits}</td>
                          <td className="px-4 py-3 text-sm text-center" colSpan={2}></td>
                          <td className="px-4 py-3 text-sm text-center">
                            {semesterGrades.reduce((sum, g) => sum + (parseFloat(g.gpa.toString()) * 3), 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Semester Footer */}
                  <div className="bg-gray-50 px-6 py-3 border-t">
                    <div className="text-sm font-semibold text-gray-700">
                      GPA (Grade Point Average) = <span className="text-blue-600">{semesterGPA}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Overall Summary Card - Only show when viewing all semesters */}
            {selectedSemester === 'all' && grades.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Overall Academic Summary</h3>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90 mb-1">Total Semesters</div>
                    <div className="text-3xl font-bold">{uniqueSemesters.length}</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90 mb-1">Total Courses</div>
                    <div className="text-3xl font-bold">{grades.length}</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90 mb-1">Cumulative GPA</div>
                    <div className="text-3xl font-bold">{overallGPA}</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90 mb-1">Courses Passed</div>
                    <div className="text-3xl font-bold">
                      {grades.filter(g => g.status === 'passed').length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Print Note */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>This is an unofficial transcript. For official transcripts, please contact the HOD office.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}