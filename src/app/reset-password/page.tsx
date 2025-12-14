"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const BG =
  "https://images.unsplash.com/photo-1594537180492-e2152862c93?q=80&w=1974&auto=format&fit=crop";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset link");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Auto-redirect to login after 5 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 5000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {/* Floating glow */}
      <div className="absolute -top-10 left-1/3 w-96 h-96 rounded-full bg-yellow-300/20 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-yellow-200/10 blur-[160px]" />

      {/* Back button */}
      <Link href="/login" className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          className="text-white/80 hover:text-yellow-300 hover:bg-white/10 px-4 py-2 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </Button>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-xl border border-yellow-200/30 shadow-2xl rounded-3xl px-6 py-8">
          <CardHeader className="text-center mb-4">
            <CardTitle className="text-4xl font-serif text-white tracking-wide">
              Reset Password
            </CardTitle>
            <p className="text-sm text-white/70 mt-2">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {success ? (
              <div className="text-center space-y-4 py-6">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">
                  Check Your Email
                </h3>
                <p className="text-white/80 text-sm">
                  If an account exists with that email, we've sent a password
                  reset link.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-3">
                  <p className="text-yellow-300 text-xs font-medium">
                    📧 Don't see the email? Check your spam/junk folder
                  </p>
                </div>
                <p className="text-white/60 text-xs">
                  Redirecting to login in 5 seconds...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <p className="text-center text-red-400 font-medium text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </p>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/10 text-white placeholder:text-gray-300 border border-white/20 rounded-full focus:border-yellow-300 focus:ring-yellow-200/40"
                    placeholder="Email Address"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full font-semibold bg-yellow-300 text-black hover:bg-yellow-200 transition-all shadow-md hover:shadow-yellow-300/40"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <p className="text-center text-white/70 text-sm pt-2">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-yellow-300 hover:text-yellow-200 font-medium"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
