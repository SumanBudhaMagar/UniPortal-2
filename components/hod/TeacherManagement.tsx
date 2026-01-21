// FILE 5: components/hod/TeacherManagement.tsx
// ============================================

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Teacher, NewTeacher } from './types';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: NewTeacher) => Promise<void>;
}

export default function TeacherManagement({
  teachers,
  onAddTeacher,
}: TeacherManagementProps) {
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState<NewTeacher>({ email: '' });

  const handleAddTeacher = async () => {
    if (!newTeacher.email) {
      alert('Please enter teacher email');
      return;
    }
    await onAddTeacher(newTeacher);
    setNewTeacher({ email: '' });
    setShowAddTeacher(false);
  };

  return (
    <Card className='login'>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>👨‍🏫 Teachers Management</CardTitle>
        <Button 
          onClick={() => setShowAddTeacher(!showAddTeacher)}
          className="bg-white border-[2px] text-black border-black hover:bg-slate-200"
        >
          + Add Teacher
        </Button>
      </CardHeader>
      
      <CardContent>
        {showAddTeacher && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg space-y-4">
            <div>
              <Label>Teacher Email (must be registered)</Label>
              <Input
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({email: e.target.value})}
                placeholder="teacher@ku.edu.np"
              />
              <p className="text-xs text-gray-600 mt-1">
                Note: Teacher must be registered in the system first
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddTeacher}
                className="bg-white border-[2px] text-black border-black  hover:bg-slate-200"
              >
                Add Teacher
              </Button>
              <Button 
                onClick={() => setShowAddTeacher(false)} 
                className="bg-gray-400 hover:bg-slate-400 border-[2px] border-black"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {teachers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No teachers in this department yet.
            </div>
          ) : (
            teachers.map((teacher) => (
              <div 
                key={teacher.id} 
                className="flex justify-between items-center p-4rounded-lg hover:bg-slate-100 border-[2px] shadow-sm shadow-slate-500 border-slate-500"
              >
                <div>
                  <div className="font-semibold">{teacher.user_metadata?.name}</div>
                  <div className="text-sm text-gray-600">{teacher.email}</div>
                  <div className="text-xs text-gray-500">
                    ID: {teacher.user_metadata?.teacher_id}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
