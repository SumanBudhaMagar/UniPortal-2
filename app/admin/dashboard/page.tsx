'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Type definitions
interface Admin {
  id: string;
  email: string;
  name: string;
  loginTime: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
  has_hod?: boolean;
}

interface HOD {
  id: string;
  user_id: string | null;
  department_id: string;
  email: string;
  name: string;
  created_at: string;
  departments?: {
    name: string;
    code: string;
  };
}

interface ExamHead {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hods, setHods] = useState<HOD[]>([]);
  const [examHeads, setExamHeads] = useState<ExamHead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddHOD, setShowAddHOD] = useState(false);
  const [showAddExamHead, setShowAddExamHead] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '' });
  const [newHOD, setNewHOD] = useState({ email: '', name: '', departmentId: '' });
  const [newExamHead, setNewExamHead] = useState({ email: '', name: '' });

  useEffect(() => {
    checkAdmin();
    loadData();
  }, []);

  const checkAdmin = () => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    setAdmin(JSON.parse(session));
  };

  const loadData = async () => {
    // Load departments
    const { data: depts } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    // Load HODs
    const { data: hodsList } = await supabase
      .from('hods')
      .select(`
        *,
        departments(name, code)
      `)
      .order('created_at', { ascending: false });
    
    setHods(hodsList || []);

    // Load Exam Heads
    const { data: examHeadsList } = await supabase
      .from('exam_heads')
      .select('*')
      .order('created_at', { ascending: false });
    
    setExamHeads(examHeadsList || []);

    // Mark which departments already have HODs
    const deptsWithHODStatus = (depts || []).map(dept => ({
      ...dept,
      has_hod: hodsList?.some(hod => hod.department_id === dept.id) || false
    }));

    setDepartments(deptsWithHODStatus);
    setLoading(false);
  };

  const handleAddDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase
      .from('departments')
      .insert([{ name: newDept.name, code: newDept.code }]);

    if (!error) {
      alert('Department added successfully!');
      setNewDept({ name: '', code: '' });
      setShowAddDept(false);
      loadData();
    } else {
      alert('Error adding department: ' + error.message);
    }
  };

  const handleAddHOD = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if department already has a HOD
    const { data: existingHOD } = await supabase
      .from('hods')
      .select('*')
      .eq('department_id', newHOD.departmentId)
      .single();

    if (existingHOD) {
      alert('This department already has a HOD! Please remove the existing HOD first.');
      return;
    }

    // Insert into hods table (this authorizes them)
    const { error } = await supabase
      .from('hods')
      .insert([{
        email: newHOD.email,
        name: newHOD.name,
        department_id: newHOD.departmentId,
        user_id: null // Will be set when they register
      }]);

    if (!error) {
      alert(`HOD authorized! ${newHOD.email} can now register as HOD for this department.`);
      setNewHOD({ email: '', name: '', departmentId: '' });
      setShowAddHOD(false);
      loadData();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure? This will remove the HOD for this department.')) return;
    
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Department deleted!');
      loadData();
    }
  };

  const handleDeleteHOD = async (id: string) => {
    if (!confirm('Are you sure you want to remove this HOD authorization?')) return;
    
    const { error } = await supabase
      .from('hods')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('HOD removed!');
      loadData();
    }
  };

  const handleAddExamHead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if exam head already exists
    const { data: existingExamHead } = await supabase
      .from('exam_heads')
      .select('*')
      .eq('email', newExamHead.email)
      .single();

    if (existingExamHead) {
      alert('An Exam Head with this email already exists!');
      return;
    }

    // Insert into exam_heads table
    const { error } = await supabase
      .from('exam_heads')
      .insert([{
        email: newExamHead.email,
        name: newExamHead.name,
        user_id: null // Will be set when they register
      }]);

    if (!error) {
      alert(`Exam Head authorized! ${newExamHead.email} can now register as Exam Head.`);
      setNewExamHead({ email: '', name: '' });
      setShowAddExamHead(false);
      loadData();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteExamHead = async (id: string) => {
    if (!confirm('Are you sure you want to remove this Exam Head authorization?')) return;
    
    const { error } = await supabase
      .from('exam_heads')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Exam Head removed!');
      loadData();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  // Get departments without HODs for the dropdown
  const departmentsWithoutHOD = departments.filter(dept => !dept.has_hod);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">👨‍💼 Admin Dashboard</h1>
            <p className="text-blue-100">Welcome, {admin?.name}</p>
          </div>
          <Button 
            onClick={handleLogout}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{departments.length}</div>
              <div className="text-blue-100">Total Departments</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{hods.length}</div>
              <div className="text-green-100">HODs</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{examHeads.length}</div>
              <div className="text-purple-100">Exam Heads</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{departmentsWithoutHOD.length}</div>
              <div className="text-orange-100">Depts Without HOD</div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Management */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>🏢 Departments</CardTitle>
            <Button 
              onClick={() => setShowAddDept(!showAddDept)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + Add Department
            </Button>
          </CardHeader>
          <CardContent>
            {showAddDept && (
              <form onSubmit={handleAddDepartment} className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department Name</Label>
                    <Input
                      value={newDept.name}
                      onChange={(e) => setNewDept({...newDept, name: e.target.value})}
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <Label>Department Code</Label>
                    <Input
                      value={newDept.code}
                      onChange={(e) => setNewDept({...newDept, code: e.target.value})}
                      placeholder="CS"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Save Department
                  </Button>
                  <Button type="button" onClick={() => setShowAddDept(false)} className="bg-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {dept.name}
                      {dept.has_hod && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          ✓ Has HOD
                        </span>
                      )}
                      {!dept.has_hod && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          ⚠ No HOD
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Code: {dept.code}</div>
                  </div>
                  <Button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HODs Management */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>👥 HODs (Heads of Department)</CardTitle>
            <Button 
              onClick={() => setShowAddHOD(!showAddHOD)}
              className="bg-green-600 hover:bg-green-700"
              disabled={departmentsWithoutHOD.length === 0}
            >
              + Authorize New HOD
            </Button>
          </CardHeader>
          <CardContent>
            {departmentsWithoutHOD.length === 0 && !showAddHOD && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                ℹ️ All departments already have HODs assigned. Remove an existing HOD to add a new one.
              </div>
            )}

            {showAddHOD && (
              <form onSubmit={handleAddHOD} className="mb-6 p-4 bg-green-50 rounded-lg space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>HOD Name</Label>
                    <Input
                      value={newHOD.name}
                      onChange={(e) => setNewHOD({...newHOD, name: e.target.value})}
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label>HOD Email (KU Email)</Label>
                    <Input
                      type="email"
                      value={newHOD.email}
                      onChange={(e) => setNewHOD({...newHOD, email: e.target.value})}
                      placeholder="hod.cs@ku.edu.np"
                      required
                    />
                  </div>
                  <div>
                    <Label>Department (Only departments without HOD shown)</Label>
                    <select
                      value={newHOD.departmentId}
                      onChange={(e) => setNewHOD({...newHOD, departmentId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">Select Department</option>
                      {departmentsWithoutHOD.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                    {departmentsWithoutHOD.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        No departments available. All departments have HODs assigned.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={departmentsWithoutHOD.length === 0}
                  >
                    Authorize HOD
                  </Button>
                  <Button type="button" onClick={() => setShowAddHOD(false)} className="bg-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {hods.map((hod) => (
                <div key={hod.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <div className="font-semibold">{hod.name}</div>
                    <div className="text-sm text-gray-600">{hod.email}</div>
                    <div className="text-sm text-blue-600">
                      HOD of {hod.departments?.name} ({hod.departments?.code})
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteHOD(hod.id)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exam Heads Management */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>📝 Exam Heads</CardTitle>
            <Button 
              onClick={() => setShowAddExamHead(!showAddExamHead)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              + Authorize Exam Head
            </Button>
          </CardHeader>
          <CardContent>
            {showAddExamHead && (
              <form onSubmit={handleAddExamHead} className="mb-6 p-4 bg-purple-50 rounded-lg space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Exam Head Name</Label>
                    <Input
                      value={newExamHead.name}
                      onChange={(e) => setNewExamHead({...newExamHead, name: e.target.value})}
                      placeholder="Dr. Jane Smith"
                      required
                    />
                  </div>
                  <div>
                    <Label>Exam Head Email (KU Email)</Label>
                    <Input
                      type="email"
                      value={newExamHead.email}
                      onChange={(e) => setNewExamHead({...newExamHead, email: e.target.value})}
                      placeholder="examhead@ku.edu.np"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Authorize Exam Head
                  </Button>
                  <Button type="button" onClick={() => setShowAddExamHead(false)} className="bg-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {examHeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No Exam Heads authorized yet.
                </div>
              ) : (
                examHeads.map((examHead) => (
                  <div key={examHead.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div>
                      <div className="font-semibold">{examHead.name}</div>
                      <div className="text-sm text-gray-600">{examHead.email}</div>
                      <div className="text-sm text-purple-600">
                        Head of Exam Center
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteExamHead(examHead.id)}
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
      </div>
    </div>
  );
}