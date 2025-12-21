'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle,CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting admin login with email:", email);

      // Check admin credentials
      const { data: admin, error: dbError } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .single();

      console.log("Database query result:", { admin, dbError });

      if (dbError) {
        console.error("Database error:", dbError);
        setError("Database error: " + dbError.message);
        setLoading(false);
        return;
      }

      if (!admin) {
        console.log("No admin found with this email");
        setError("Invalid admin credentials - email not found");
        setLoading(false);
        return;
      }

      console.log("Admin found:", admin.email);
      console.log("Stored password:", admin.password_hash);
      console.log("Entered password:", password);

      // Simple password comparison (FOR TESTING - replace with bcrypt later)
      if (password !== admin.password_hash) {
        console.log("Password mismatch");
        setError("Invalid admin credentials - wrong password");
        setLoading(false);
        return;
      }

      console.log("Login successful!");

      // Store admin session in localStorage
      localStorage.setItem('adminSession', JSON.stringify({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        loginTime: new Date().toISOString()
      }));

      router.push('/admin/dashboard');
    } catch (err) {
      console.error("Catch block error:", err);
      setError("An error occurred during login: " + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  return (
    
     <Card className="w-full max-w-md">
        <CardHeader>
        
         <CardTitle className="text-2xl text-center font-bold">
    Admin Portal
  </CardTitle>
  <CardDescription className="text-center">
    University Administration Access
  </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-900 font-semibold">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ku.edu.np"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-blue-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-900 font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-blue-300 focus:border-blue-500"
              />
            </div>
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
              disabled={loading}
            >
              {loading ? "Verifying..." : "🔐 Access Admin Panel"}
            </Button>
          </form>

          
        </CardContent>
      </Card>
    
  );
}