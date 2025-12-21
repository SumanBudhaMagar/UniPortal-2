"use client";

import { Button } from "@/components/forms/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/forms/card";
import { Input } from "@/components/forms/input";
import { Label } from "@/components/forms/label";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setMessage(
        "Password reset link has been sent to your email. Please check your inbox (and spam folder)."
      );
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@student.ku.edu.np"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>

      <div className="mt-4 text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    </Card>
  );
}