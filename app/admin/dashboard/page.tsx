'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardStats from '@/components/admin/DashboardStats';
import DepartmentsSection from '@/components/admin/DepartmentsSection';
import HODSection from "@/components/admin/HODSection";
import ExamHeadSection from '@/components/admin/ExamHeadSection';
import { toast } from 'react-toastify';



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

const handleAddDepartment = async (data: {
  name: string;
  code: string;
}) => {
  const { error } = await supabase
    .from('departments')
    .insert([
      {
        name: data.name,
        code: data.code,
      },
    ]);

  if (error) {
    toast.error('Error adding department: ' + error.message);
    return;
  }

  toast.success('Department added successfully!');
  loadData();
};


const handleAddHOD = async (data: {
  name: string;
  email: string;
  departmentId: string;
}) => {
  if (!data.departmentId) {
    toast.info("Please select a department!");
    return;
  }

  // Check if department already has a HOD
  const { data: existingHOD } = await supabase
    .from("hods")
    .select("*")
    .eq("department_id", data.departmentId)
    .single();

  if (existingHOD) {
    toast.info("This department already has a HOD! Remove the existing HOD first.");
    return;
  }

  const { error } = await supabase
    .from("hods")
    .insert([{
      email: data.email,
      name: data.name,
      department_id: data.departmentId,
      user_id: null
    }]);

  if (error) {
    toast.error("Error: " + error.message);
  } else {
    toast.success(`HOD authorized! ${data.email} can now register.`);
    loadData();
  }
};


  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure? This will remove the HOD for this department.')) return;
    
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Department deleted!');
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
      toast.success('HOD removed!');
      loadData();
    }
  };

const handleAddExamHead = async (data: { name: string; email: string }) => {
  // Check if exam head already exists
  const { data: existingExamHead } = await supabase
    .from('exam_heads')
    .select('*')
    .eq('email', data.email)
    .single();

  if (existingExamHead) {
    toast.info('An Exam Head with this email already exists!');
    return;
  }

  // Insert into exam_heads table
  const { error } = await supabase
    .from('exam_heads')
    .insert([{
      email: data.email,
      name: data.name,
      user_id: null // Will be set when they register
    }]);

  if (!error) {
    toast.success(`Exam Head authorized! ${data.email} can now register as Exam Head.`);
    loadData();
  } else {
    toast.error('Error: ' + error.message);
  }
};


  const handleDeleteExamHead = async (id: string) => {
    if (!confirm('Are you sure you want to remove this Exam Head authorization?')) return;
    
    const { error } = await supabase
      .from('exam_heads')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Exam Head removed!');
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
      <AdminHeader admin={admin} onLogout={handleLogout} />

   

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Stats */}
        <DashboardStats
  departmentsCount={departments.length}
  hodsCount={hods.length}
  examHeadsCount={examHeads.length}
  noHodCount={departmentsWithoutHOD.length}
/>

        {/* Departments Management */}
        <DepartmentsSection
  departments={departments}
  onAddDepartment={async (data) => {
    await handleAddDepartment({
      name: data.name,
      code: data.code,
    });
  }}
  onDeleteDepartment={handleDeleteDepartment}
/>
     

        {/* HODs Management */}
        <HODSection
  hods={hods}
  departmentsWithoutHOD={departmentsWithoutHOD}
  onAddHOD={async (data) => {
    await handleAddHOD({
      name: data.name,
      email: data.email,
      departmentId: data.departmentId,
    });
  }}
  onDeleteHOD={handleDeleteHOD}
/>

        {/* Exam Heads Management */}
      <ExamHeadSection
  examHeads={examHeads}
  onAddExamHead={handleAddExamHead}
  onDeleteExamHead={handleDeleteExamHead}
/>

      </div>
    </div>
  );
}