// components/hod/StudentManagement.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student, NewStudent } from './types';
import { downloadCSVTemplate } from './utils';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: NewStudent) => Promise<void>;
  onBulkUpload: (file: File) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
}

export default function StudentManagement({
  students,
  onAddStudent,
  onBulkUpload,
  onDeleteStudent,
}: StudentManagementProps) {
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({ 
    name: '', 
    email: '', 
    studentId: '',
    semester: '1' // ADD: Default semester
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.studentId || !newStudent.semester) {
      alert('Please fill all fields');
      return;
    }
    await onAddStudent(newStudent);
    setNewStudent({ name: '', email: '', studentId: '', semester: '1' });
    setShowAddStudent(false);
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;
    
    setUploading(true);
    try {
      await onBulkUpload(csvFile);
      setCsvFile(null);
      setShowBulkUpload(false);
    } finally {
      setUploading(false);
    }
  };

  // Helper function to get semester display name
  const getSemesterName = (semester: number) => {
    const year = Math.ceil(semester / 2);
    const sem = semester % 2 === 0 ? 2 : 1;
    return `Year ${year} - Semester ${sem}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>🎓 Students Management</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="bg-green-600 hover:bg-green-700"
          >
            📁 Bulk Upload
          </Button>
          <Button 
            onClick={() => setShowAddStudent(!showAddStudent)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Add Student
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Bulk Upload Form */}
        {showBulkUpload && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg space-y-4">
            <div>
              <Label>Upload CSV File</Label>
              <p className="text-xs text-gray-600 mb-2">
                Format: Name, Email, Student ID, Semester (one student per line)
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="text-xs text-blue-600 hover:underline mt-1"
              >
                Download CSV Template
              </button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleBulkUpload}
                className="bg-green-600 hover:bg-green-700"
                disabled={uploading || !csvFile}
              >
                {uploading ? 'Uploading...' : 'Upload Students'}
              </Button>
              <Button 
                onClick={() => setShowBulkUpload(false)} 
                className="bg-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Manual Add Form - UPDATED WITH SEMESTER */}
        {showAddStudent && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Student Name *</Label>
                <Input
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Student Email *</Label>
                <Input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="john@student.ku.edu.np"
                />
              </div>
              <div>
                <Label>Student ID *</Label>
                <Input
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                  placeholder="CS-2024-001"
                />
              </div>
              {/* NEW: Semester Selection */}
              <div>
                <Label>Current Semester *</Label>
                <select
                  value={newStudent.semester}
                  onChange={(e) => setNewStudent({...newStudent, semester: e.target.value})}
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
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddStudent}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Student
              </Button>
              <Button 
                onClick={() => setShowAddStudent(false)} 
                className="bg-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Students List - UPDATED TO SHOW SEMESTER */}
        <div className="space-y-3">
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students added yet. Add students manually or upload CSV.
            </div>
          ) : (
            students.map((student) => (
              <div 
                key={student.id} 
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {student.name}
                    {student.status === 'registered' ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        ✓ Registered
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{student.email}</div>
                  <div className="text-xs text-gray-500">
                    ID: {student.student_id}
                    {/* NEW: Show current semester */}
                    {student.current_semester && (
                      <span className="ml-3 text-blue-600">
                        📚 {getSemesterName(student.current_semester)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => onDeleteStudent(student.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}