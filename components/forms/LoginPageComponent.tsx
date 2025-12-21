"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
const LoginPageComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Please verify your email before logging in. Check your inbox (and spam folder)."
          );
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(signInError.message || "Login failed");
        }
        setLoading(false);
        return;
      }

      // Check if user role matches selected userType
      const userRole = data.user?.user_metadata?.role;
      if (userRole && userRole !== userType) {
        setError(
          `This account is registered as a ${userRole}. Please select the correct account type.`
        );
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (userRole === "student") {
        router.push("/dashboard/student");
      } else if (userRole === "teacher") {
        router.push("/dashboard/teacher");
      } else if (userRole === "hod") {
        const departmentId = data.user?.user_metadata?.department_id;
        router.push(`/dashboard/hod/${departmentId}`);
      } else if (userRole === "exam_head") {
        router.push("dashboard/examhead");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription className="flex items-center gap-1">
          Enter your credentials to access your account
          <Link
            href="/admin/login"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            •
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Login as</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === "student"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <span>Student</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === "teacher"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <span>Teacher</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="hod"
                  checked={userType === "hod"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <span>HOD</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="exam_head"
                  checked={userType === "exam_head"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <span>Exam Head</span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={
                userType === "student"
                  ? "you@student.ku.edu.np"
                  : userType === "teacher"
                  ? "you@teacher.ku.edu.np"
                  : userType === "hod"
                  ? "hod@ku.edu.np"
                  : "examhead@ku.edu.np"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>

      <div className="mt-4 space-y-2 text-center text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot your password?
        </Link>
        <div>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default LoginPageComponent;
