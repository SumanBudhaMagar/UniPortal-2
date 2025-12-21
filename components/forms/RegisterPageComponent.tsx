'use client';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { RegisterDepartment } from "@/lib/type";

const RegisterPageComponent = () => {
    const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student");
  const [departments, setDepartments] = useState<RegisterDepartment[]>([]);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (data) setDepartments(data as RegisterDepartment[]);
  };

  // Generate UUID for student_id and teacher_id
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Validate email based on user type
  const validateEmail = (email: string, userType: string) => {
    const lowerEmail = email.toLowerCase().trim();
    
    if (userType === "student") {
      return lowerEmail.endsWith("@student.ku.edu.np");
    } else if (userType === "teacher") {
      if (lowerEmail.endsWith("@student.ku.edu.np")) {
        return false;
      }
      return lowerEmail.endsWith("@teacher.ku.edu.np") || lowerEmail.endsWith("@ku.edu.np");
    } else if (userType === "hod" || userType === "exam_head") {
      if (lowerEmail.endsWith("@student.ku.edu.np") || lowerEmail.endsWith("@teacher.ku.edu.np")) {
        return false;
      }
      return lowerEmail.endsWith("@ku.edu.np");
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    console.log("User Type:", userType);
    console.log("Email:", email);
    console.log("Validation Result:", validateEmail(email, userType));

    // Validate email based on user type
    if (!validateEmail(email, userType)) {
      if (userType === "student") {
        setError("Students must use @student.ku.edu.np email address.");
      } else if (userType === "teacher") {
        setError("Teachers must use @teacher.ku.edu.np or @ku.edu.np email address.");
      } else if (userType === "hod") {
        setError("HODs must use @ku.edu.np email address (not @student or @teacher).");
      } else if (userType === "exam_head") {
        setError("Exam Heads must use @ku.edu.np email address (not @student or @teacher).");
      }
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // For students, check if they're authorized
    if (userType === 'student') {
      const { data: studentAuth, error: authError } = await supabase
        .from('authorized_students')
        .select('*')
        .eq('email', email)
        .single();

      if (authError || !studentAuth) {
        setError('Your email is not authorized to register. Please contact your department HOD.');
        return;
      }

      // Check if already registered
      if (studentAuth.status === 'registered') {
        setError('This email has already been registered. Please login instead.');
        return;
      }

      // Set department from authorized record
      setDepartment(studentAuth.department_id);
    }

    if (!department && (userType === "student" || userType === "hod")) {
      setError("Please select a department.");
      return;
    }

    // For HOD, check if they're authorized
    if (userType === 'hod') {
      const { data: hodCheck } = await supabase
        .from('hods')
        .select('*')
        .eq('email', email)
        .eq('department_id', department)
        .single();

      if (!hodCheck) {
        setError('You are not authorized to register as HOD for this department. Please contact the administrator.');
        return;
      }
    }

    setLoading(true);

    try {
      const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/verify`;
      
      // Prepare user metadata based on user type
      const userMetadata: Record<string, any> = {
        role: userType,
      };

      // Add specific fields based on user type
      if (userType === "student") {
        // Get student info from authorized_students
        const { data: studentAuth } = await supabase
          .from('authorized_students')
          .select('*, departments(name, code)')
          .eq('email', email)
          .single();

        userMetadata.name = studentAuth?.name || name;
        userMetadata.student_id = studentAuth?.student_id;
        userMetadata.department_id = studentAuth?.department_id;
        userMetadata.department = studentAuth?.departments?.name;
        userMetadata.department_code = studentAuth?.departments?.code;
      } else if (userType === "teacher") {
        userMetadata.name = name;
        userMetadata.teacher_id = generateUUID();
      } else if (userType === "hod") {
        userMetadata.name = name;
        const selectedDept = departments.find(d => d.id === department);
        userMetadata.department_id = department;
        userMetadata.department_name = selectedDept?.name;
        userMetadata.department_code = selectedDept?.code;
      } else if (userType === "exam_head") {
        userMetadata.name = name;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: redirectTo,
        },
      });

      if (signUpError) {
        console.error("Supabase Error:", signUpError);
        setError(signUpError.message || "Signup failed");
        setLoading(false);
        return;
      }

      // Check if user already exists
      if (data?.user?.identities?.length === 0) {
        setError("An account with this email already exists. Please login instead.");
        setLoading(false);
        return;
      }

      // If student, update status to 'registered' and link user_id
      if (userType === 'student' && data.user) {
        await supabase
          .from('authorized_students')
          .update({ 
            status: 'registered',
            user_id: data.user.id 
          })
          .eq('email', email);
      }

      // If HOD, update the user_id in hods table
      if (userType === 'hod' && data.user) {
        await supabase
          .from('hods')
          .update({ user_id: data.user.id })
          .eq('email', email)
          .eq('department_id', department);
      }

      // If Exam Head, update the user_id in exam_heads table
      if (userType === 'exam_head' && data.user) {
        await supabase
          .from('exam_heads')
          .update({ user_id: data.user.id })
          .eq('email', email);
      }

      setMessage(
        "A verification email has been sent to your university inbox. Please open it and confirm your email to activate your account."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Register as</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === "student"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                Student
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === "teacher"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                Teacher
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="userType"
                  value="hod"
                  checked={userType === "hod"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                HOD
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="userType"
                  value="exam_head"
                  checked={userType === "exam_head"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                Exam Head
              </label>
            </div>
          </div>

          {/* Name field - only for teachers, HODs, and Exam Heads (students get name from authorized list) */}
          {(userType === "teacher" || userType === "hod" || userType === "exam_head") && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Department Selection only for HODs (students get it from authorized list) */}
          {userType === "hod" && (
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">University Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={
                userType === "student"
                  ? "yourname@student.ku.edu.np"
                  : userType === "teacher"
                  ? "yourname@teacher.ku.edu.np or yourname@ku.edu.np"
                  : userType === "hod"
                  ? "hod@ku.edu.np"
                  : "examhead@ku.edu.np"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {userType === "student" && (
              <p className="text-xs text-gray-500">
                Your email must be authorized by your HOD before registration
              </p>
            )}
            {userType === "exam_head" && (
              <p className="text-xs text-gray-500">
                Your email must be authorized by the Admin before registration
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {message}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
    </>
  )
}

export default RegisterPageComponent
