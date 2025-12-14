"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { signIn } from "next-auth/react";

const BG =
  "https://images.unsplash.com/photo-1594537180492-e2152862c93?q=80&w=1974&auto=format&fit=crop";

export default function SignupPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setPasswordStrength({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);


  async function handleSignup(e: any) {
    e.preventDefault();
    setError("");
    
    // Validate password strength
    if (!passwordStrength.minLength) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setLoading(true);

    const form = new FormData(e.target);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const phone = form.get("phone") as string;

    // ---- FIX 1: Send JSON to API ----
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // ---- FIX 2: Auto-login after signup ----
    const loginRes = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/contact",
    });

    setLoading(false);
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
      {/* Soft gold vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {/* Gold aura */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-yellow-300/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-200/10 blur-[150px] rounded-full" />

      {/* Signup Card */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <Card
          className="
            bg-white/10 backdrop-blur-xl
            border border-yellow-200/30
            shadow-2xl rounded-3xl
            px-6 py-8
          "
        >
          <CardHeader className="text-center mb-4">
            <CardTitle className="text-4xl font-serif text-white tracking-wide">
              Create Account
            </CardTitle>
            <p className="text-sm text-white/70 mt-2">
              Join us and manage your premium travel bookings.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <p className="text-center text-red-400 font-medium text-sm">
                {error}
              </p>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Name */}
              <div>
                <Label className="text-white/80">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    name="name"
                    required
                    placeholder="John Doe"
                    className="
                      pl-11 h-12 bg-white/10 text-white placeholder:text-gray-300 
                      border border-white/20 rounded-full
                      focus:border-yellow-300 focus:ring-yellow-200/40
                    "
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-white/80">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="
                      pl-11 h-12 bg-white/10 text-white placeholder:text-gray-300
                      border border-white/20 rounded-full
                      focus:border-yellow-300 focus:ring-yellow-200/40
                    "
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <Label className="text-white/80">Phone Number (Optional)</Label>
                <div className="relative mt-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    className="
                      pl-11 h-12 bg-white/10 text-white placeholder:text-gray-300
                      border border-white/20 rounded-full
                      focus:border-yellow-300 focus:ring-yellow-200/40
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label className="text-white/80">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    type="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      pl-11 h-12 bg-white/10 text-white placeholder:text-gray-300
                      border border-white/20 rounded-full
                      focus:border-yellow-300 focus:ring-yellow-200/40
                    "
                  />
                </div>
                
                {/* Password Strength Indicators */}
                {password && (
                  <div className="space-y-1 mt-2 px-2">
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
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="
                  w-full h-12 rounded-full font-semibold
                  bg-yellow-300 text-black
                  hover:bg-yellow-200 transition-all
                  shadow-md hover:shadow-yellow-300/40
                "
              >
                {loading ? "Creating..." : "Sign Up"}
              </Button>
            </form>

            <p className="text-center text-white/70 text-sm pt-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-yellow-300 hover:text-yellow-200 font-medium"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
