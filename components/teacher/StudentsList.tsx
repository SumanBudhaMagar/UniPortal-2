// FILE 5: components/teacher/StudentsList.tsx
// ============================================

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student, Course } from './types';
import { getSemesterName } from './utils';

interface StudentsListProps {
  students: Student[];
  selectedCourse: Course | null;
  onSelectStudent: (student: Student) => void;
}

export default function StudentsList({ 
  students, 
  selectedCourse,
  onSelectStudent 
}: StudentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          👥 Students {selectedCourse && `- ${selectedCourse.course_name}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search students by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No students found matching your search.' : 'No students enrolled in this course.'}
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredStudents.map((student) => (
              <div 
                key={student.user_id} 
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex-1">
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-sm text-gray-600">
                    ID: {student.student_id} | {getSemesterName(student.current_semester)}
                  </div>
                  <div className="text-xs text-gray-500">{student.email}</div>
                </div>
                <Button
                  onClick={() => onSelectStudent(student)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Grade
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}