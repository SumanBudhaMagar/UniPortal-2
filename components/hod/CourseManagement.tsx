// ============================================
// FILE 6: components/hod/CourseManagement.tsx
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
}

export default function CourseManagement({
  courses,
  teachers,
  onAddCourse,
  onDeleteCourse,
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
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user_metadata?.name} ({teacher.email})
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
                    {semCourses.map((course) => (
                      <div 
                        key={course.id} 
                        className="flex justify-between items-center p-4 rounded-lg hover:bg-slate-100 border-[2px] shadow-sm shadow-slate-500 border-slate-500"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{course.course_name}</div>
                          <div className="text-sm text-gray-600">
                            Code: {course.course_code} | Credits: {course.credits}
                            {course.teacher_name && ` | Teacher: ${course.teacher_name}`}
                          </div>
                        </div>
                        <Button
                          onClick={() => onDeleteCourse(course.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
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
