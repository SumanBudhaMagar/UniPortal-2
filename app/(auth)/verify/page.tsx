"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function VerifyPage() {
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    async function verifyEmail() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError("Verification failed. Please try again.");
          setMessage("");
          return;
        }

        if (session) {
          setMessage("Email verified successfully!");
          setIsVerified(true);
        } else {
          setError("Could not verify your email. The link may have expired.");
          setMessage("");
        }
      } catch (err) {
        setError("An error occurred during verification.");
        setMessage("");
      }
    }

    verifyEmail();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center">
        {message && (
          <div className="mb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-green-600 mb-4">{message}</p>
            {isVerified && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Your account has been verified. You can now log in.
                </p>
                <Link 
                  href="/login"
                  className="inline-block w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">{error}</p>
            <p className="mt-2 text-sm">
              Please try requesting a new verification email or contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}