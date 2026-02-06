// ============================================
// FILE: components/hod/CourseManagement.tsx (Updated)
// ============================================

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Course, Teacher, NewCourse } from './types';
import { getSemesterName } from './utils';

interface CourseManagementProps {
  courses: Course[];
  teachers: Teacher[];
  onAddCourse: (course: NewCourse) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onAssignTeacher: (courseId: string, teacherUserId: string | null) => Promise<void>;
  onUpdateMarksScheme: (
    courseId: string,
    payload: {
      teacher_marks_total: number;
      exam_marks_total: number;
    }
  ) => Promise<void>;
}

export default function CourseManagement({
  courses,
  teachers,
  onAddCourse,
  onDeleteCourse,
  onAssignTeacher,
  onUpdateMarksScheme,
}: CourseManagementProps) {
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourse>({ 
    courseName: '', 
    courseCode: '', 
    semester: '1', 
    year: '1',
    credits: '3', 
    teacherId: '' 
  });

  const [selectedTeacherByCourse, setSelectedTeacherByCourse] = useState<Record<string, string>>({});
  const [assigningCourseId, setAssigningCourseId] = useState<string>('');
  const [assignOpenCourseId, setAssignOpenCourseId] = useState<string>('');

  const [marksOpenCourseId, setMarksOpenCourseId] = useState<string>('');
  const [savingMarksCourseId, setSavingMarksCourseId] = useState<string>('');
  const [marksSchemeByCourse, setMarksSchemeByCourse] = useState<Record<string, number>>({});

  const handleAddCourse = async () => {
    if (!newCourse.courseName || !newCourse.courseCode) {
      alert('Please fill required fields');
      return;
    }
    await onAddCourse(newCourse);
    setNewCourse({ 
      courseName: '', 
      courseCode: '', 
      semester: '1', 
      year: '1',
      credits: '3', 
      teacherId: '' 
    });
    setShowAddCourse(false);
  };

  const handleYearChange = (year: string) => {
    setNewCourse(prev => {
      const minSem = (parseInt(year) - 1) * 2 + 1;
      const currentSem = parseInt(prev.semester);
      
      if (currentSem < minSem || currentSem > minSem + 1) {
        return { ...prev, year, semester: minSem.toString() };
      }
      return { ...prev, year };
    });
  };

  return (
    <Card className='login'>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>📚 Courses Management</CardTitle>
        <Button 
          onClick={() => setShowAddCourse(!showAddCourse)}
          className="bg-white border-[2px] text-black border-black hover:bg-slate-200"
        >
          + Add Course
        </Button>
      </CardHeader>
      
      <CardContent>
        {showAddCourse && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Course Name</Label>
                <Input
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                  placeholder="Data Structures"
                />
              </div>
              <div>
                <Label>Course Code</Label>
                <Input
                  value={newCourse.courseCode}
                  onChange={(e) => setNewCourse({...newCourse, courseCode: e.target.value})}
                  placeholder="CS-201"
                />
              </div>
              <div>
                <Label>Year (1-4)</Label>
                <select
                  value={newCourse.year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
              <div>
                <Label>Semester (1-8)</Label>
                <select
                  value={newCourse.semester}
                  onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="1">Semester 1 (Year 1)</option>
                  <option value="2">Semester 2 (Year 1)</option>
                  <option value="3">Semester 3 (Year 2)</option>
                  <option value="4">Semester 4 (Year 2)</option>
                  <option value="5">Semester 5 (Year 3)</option>
                  <option value="6">Semester 6 (Year 3)</option>
                  <option value="7">Semester 7 (Year 4)</option>
                  <option value="8">Semester 8 (Year 4)</option>
                </select>
              </div>
              <div>
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                  placeholder="3"
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <Label>Assign Teacher (Optional)</Label>
                <select
                  value={newCourse.teacherId}
                  onChange={(e) => setNewCourse({...newCourse, teacherId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">No teacher assigned</option>
                  {teachers
                    .filter(t => t.status === 'registered' && !!t.user_id)
                    .map((teacher) => (
                      <option key={teacher.user_id!} value={teacher.user_id!}>
                        {teacher.name || teacher.email} ({teacher.email})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddCourse}
                className="bg-white border-[2px] text-black border-black hover:bg-slate-100"
              >
                Add Course
              </Button>
              <Button 
                onClick={() => setShowAddCourse(false)} 
                className="bg-gray-400 hover:bg-slate-400 border-[2px] border-black"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4 ">
          {courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No courses created yet. Add courses for your department.
            </div>
          ) : (
            [...Array(8)].map((_, idx) => {
              const sem = idx + 1;
              const semCourses = courses.filter(c => c.semester === sem);
              if (semCourses.length === 0) return null;
              
              return (
                <div key={sem}>
                  <h3 className="font-semibold text-lg mb-2 text-gray-700">
                    {getSemesterName(sem)}
                  </h3>
                  <div className="space-y-2">

                    {semCourses.map((course) => {
                      const registeredTeachers = teachers.filter(t => t.status === 'registered' && !!t.user_id);

                      const currentTeacherValue =
                        selectedTeacherByCourse[course.id] !== undefined
                          ? selectedTeacherByCourse[course.id]
                          : (course.teacher_id || '');

                      const currentScheme = marksSchemeByCourse[course.id] ?? course.teacher_marks_total ?? 25;

                      return (
                        <div 
                          key={course.id} 
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 space-y-4"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="font-semibold">{course.course_name}</div>
                              <div className="text-sm text-gray-600">
                                Code: {course.course_code} | Credits: {course.credits}
                                {course.teacher_name && ` | Teacher: ${course.teacher_name}`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Marking Scheme: {course.exam_marks_total || 75}/{course.teacher_marks_total || 25}
                                {!course.teacher_id && (
                                  <span className="ml-2 text-orange-600 font-semibold">⚠ No teacher assigned</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setAssignOpenCourseId(assignOpenCourseId === course.id ? '' : course.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Assign Teacher
                              </Button>
                              <Button
                                onClick={() => {
                                  setMarksOpenCourseId(marksOpenCourseId === course.id ? '' : course.id);
                                  setMarksSchemeByCourse(prev => ({
                                    ...prev,
                                    [course.id]: course.teacher_marks_total ?? 25
                                  }));
                                }}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                Set Scheme
                              </Button>
                              <Button
                                onClick={() => onDeleteCourse(course.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          {/* Assign Teacher Section */}
                          {assignOpenCourseId === course.id && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-white p-3 border rounded-lg">
                              <div className="md:col-span-2">
                                <Label>Assigned Teacher</Label>
                                <select
                                  value={currentTeacherValue}
                                  onChange={(e) =>
                                    setSelectedTeacherByCourse(prev => ({
                                      ...prev,
                                      [course.id]: e.target.value
                                    }))
                                  }
                                  className="w-full px-3 py-2 border rounded-md"
                                >
                                  <option value="">No teacher assigned</option>
                                  {registeredTeachers.map(t => (
                                    <option key={t.user_id!} value={t.user_id!}>
                                      {t.name || t.email} ({t.teacher_id || 'No ID'})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <Button
                                onClick={async () => {
                                  setAssigningCourseId(course.id);
                                  await onAssignTeacher(course.id, currentTeacherValue || null);
                                  setAssigningCourseId('');
                                  setAssignOpenCourseId('');
                                }}
                                disabled={assigningCourseId === course.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {assigningCourseId === course.id ? 'Saving...' : 'Save'}
                              </Button>
                            </div>
                          )}

                          {/* Set Marking Scheme Section - SIMPLIFIED */}
                          {marksOpenCourseId === course.id && (
                            <div className="bg-white p-4 border rounded-lg space-y-4">
                              <div className="space-y-2">
                                <Label className="text-base font-semibold">Select Marking Scheme</Label>
                                <p className="text-sm text-gray-600">
                                  Choose how marks are distributed between Exam Head and Teacher.
                                  Teachers will configure the breakdown of their portion.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                  onClick={() => setMarksSchemeByCourse(prev => ({ ...prev, [course.id]: 25 }))}
                                  className={`p-4 border-2 rounded-lg transition ${
                                    currentScheme === 25
                                      ? 'border-purple-600 bg-purple-50'
                                      : 'border-gray-300 hover:border-purple-400'
                                  }`}
                                >
                                  <div className="text-lg font-bold">75 / 25 Scheme</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Exam Head: 75 marks
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Teacher: 25 marks
                                  </div>
                                  {currentScheme === 25 && (
                                    <div className="mt-2 text-purple-600 font-semibold">✓ Selected</div>
                                  )}
                                </button>

                                <button
                                  onClick={() => setMarksSchemeByCourse(prev => ({ ...prev, [course.id]: 50 }))}
                                  className={`p-4 border-2 rounded-lg transition ${
                                    currentScheme === 50
                                      ? 'border-purple-600 bg-purple-50'
                                      : 'border-gray-300 hover:border-purple-400'
                                  }`}
                                >
                                  <div className="text-lg font-bold">50 / 50 Scheme</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Exam Head: 50 marks
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Teacher: 50 marks
                                  </div>
                                  {currentScheme === 50 && (
                                    <div className="mt-2 text-purple-600 font-semibold">✓ Selected</div>
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  onClick={() => setMarksOpenCourseId('')}
                                  className="bg-gray-400"
                                >
                                  Close
                                </Button>
                                <Button
                                  onClick={async () => {
                                    setSavingMarksCourseId(course.id);
                                    await onUpdateMarksScheme(course.id, {
                                      teacher_marks_total: currentScheme,
                                      exam_marks_total: 100 - currentScheme
                                    });
                                    setSavingMarksCourseId('');
                                    setMarksOpenCourseId('');
                                  }}
                                  disabled={savingMarksCourseId === course.id}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  {savingMarksCourseId === course.id ? 'Saving...' : 'Save Scheme'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}