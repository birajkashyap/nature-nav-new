"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

const BG =
  "https://images.unsplash.com/photo-1594537180492-e2152862c93?q=80&w=1974&auto=format&fit=crop";

export default function ResetPasswordConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please request a new reset link.");
    }
  }, [token]);

  useEffect(() => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordStrength.minLength) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
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
      <Link href="/reset-password" className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          className="text-white/80 hover:text-yellow-300 hover:bg-white/10 px-4 py-2 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Request New Link
        </Button>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-xl border border-yellow-200/30 shadow-2xl rounded-3xl px-6 py-8">
          <CardHeader className="text-center mb-4">
            <CardTitle className="text-4xl font-serif text-white tracking-wide">
              Create New Password
            </CardTitle>
            <p className="text-sm text-white/70 mt-2">
              Enter your new password below
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {success ? (
              <div className="text-center space-y-4 py-6">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">
                  Password Reset Successful!
                </h3>
                <p className="text-white/80 text-sm">
                  Your password has been updated. You can now log in with your
                  new password.
                </p>
                <p className="text-white/60 text-xs">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            ) : !token ? (
              <div className="text-center space-y-4 py-6">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">
                  Invalid Reset Link
                </h3>
                <p className="text-white/80 text-sm">{error}</p>
                <Link href="/reset-password">
                  <Button className="mt-4 bg-yellow-300 text-black hover:bg-yellow-200 rounded-full">
                    Request New Link
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <p className="text-center text-red-400 font-medium text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </p>
                )}

                {/* New Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/10 text-white placeholder:text-gray-300 border border-white/20 rounded-full focus:border-yellow-300 focus:ring-yellow-200/40"
                    placeholder="New Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicators */}
                <div className="space-y-1 px-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        passwordStrength.minLength
                          ? "bg-green-400"
                          : "bg-white/30"
                      }`}
                    />
                    <span className="text-white/70">At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        passwordStrength.hasNumber
                          ? "bg-green-400"
                          : "bg-white/30"
                      }`}
                    />
                    <span className="text-white/70">Contains a number</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        passwordStrength.hasSpecial
                          ? "bg-green-400"
                          : "bg-white/30"
                      }`}
                    />
                    <span className="text-white/70">Contains special character</span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 h-12 bg-white/10 text-white placeholder:text-gray-300 border border-white/20 rounded-full focus:border-yellow-300 focus:ring-yellow-200/40"
                    placeholder="Confirm New Password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full font-semibold bg-yellow-300 text-black hover:bg-yellow-200 transition-all shadow-md hover:shadow-yellow-300/40"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
