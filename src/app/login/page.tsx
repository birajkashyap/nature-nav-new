"use client";

import { useEffect, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Mail, Lock, Chrome } from "lucide-react";

const BG =
  "https://images.unsplash.com/photo-1594537180492-e2152862c93?q=80&w=1974&auto=format&fit=crop";

function LoginForm() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // read ?error=something from URL (Google OAuth errors)
  const params = useSearchParams();
  const err = params.get("error");

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Handle NextAuth OAuth errors
  useEffect(() => {
    if (err === "NoAccount") {
      setError("No account found. Please sign up first.");
    }
    if (err === "OAuthAccountNotLinked") {
      setError("Email already exists. Please login with password first.");
    }
    if (err === "NoEmail") {
      setError("Google did not return your email.");
    }
  }, [err]);

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.target);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/contact",
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    window.location.href = "/contact"; // redirect after success
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

      {/* Soft floating glow */}
      <div className="absolute -top-10 left-1/3 w-96 h-96 rounded-full bg-yellow-300/20 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-yellow-200/10 blur-[160px]" />

      {/* Card */}
      <div
        className={`
          relative z-10 w-full max-w-md transition-all duration-700
          ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
        `}
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
              Welcome Back
            </CardTitle>
            <p className="text-sm text-white/70 mt-2">
              Sign in to continue your premium travel experience
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ERROR MESSAGE */}
            {error && (
              <p className="text-center text-red-400 font-medium text-sm">
                {error}
              </p>
            )}

            {/* Google Login */}
            <Button
              onClick={() => signIn("google", { callbackUrl: "/contact" })}
              className="
                w-full h-12 rounded-full text-lg font-semibold
                bg-yellow-300 text-black
                hover:bg-yellow-200 transition-all
                shadow-md hover:shadow-yellow-300/40
              "
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            {/* Separator */}
            <div className="flex items-center gap-4">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="text-xs uppercase tracking-widest text-white/60">
                or
              </span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            {/* Email + Password */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  name="email"
                  required
                  className="
                    pl-11 h-12 bg-white/10 text-white placeholder:text-gray-300
                    border border-white/20 rounded-full
                    focus:border-yellow-300 focus:ring-yellow-200/40
                  "
                  placeholder="Email Address"
                  type="email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  name="password"
                  required
                  className="
                    pl-11 h-12 bg-white/10 text-white placeholder:text-gray-300
                    border border-white/20 rounded-full
                    focus:border-yellow-300 focus:ring-yellow-200/40
                  "
                  placeholder="Password"
                  type="password"
                />
              </div>

              <div className="text-right">
                <Link
                  href="/reset-password"
                  className="text-xs text-yellow-300 hover:text-yellow-200"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="
                  w-full h-12 rounded-full font-semibold
                  bg-transparent border border-yellow-300 text-yellow-300
                  hover:bg-yellow-300 hover:text-black transition-all
                "
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-white/70 text-sm pt-2">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="text-yellow-300 hover:text-yellow-200 font-medium"
              >
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}
