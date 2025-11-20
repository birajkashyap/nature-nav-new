"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Lock, Chrome } from "lucide-react";

const BACKGROUND_IMAGE_URL =
  "https://images.unsplash.com/photo-1594537180492-e2152862c93?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const LoginPage = () => {
  const [cardReady, setCardReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCardReady(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/contact" });
  };

  const goldText =
    "text-amber-300 hover:text-amber-200 transition-colors duration-300";

  const glassCardClasses = `
        bg-black/40 backdrop-blur-xl border border-gray-700/50 shadow-2xl
        rounded-2xl p-6 md:p-8 w-full 
        max-w-xs sm:max-w-md lg:max-w-sm 
        transition-all duration-500
        border-t-2 border-t-amber-400/50 
        hover:shadow-amber-500/10 hover:shadow-2xl
    `;

  const formInputClasses = `
        bg-black/30 border-gray-700 placeholder:text-gray-500 text-white h-12
        focus:border-amber-400 
        focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-0 
        transition-shadow duration-300
    `;

  const fadeInClasses = cardReady
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-12";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-brightness-[0.1] pointer-events-none"></div>

      {/* Floating Back Navigation */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20"
        aria-label="Back to Home"
      >
        <Button
          variant="ghost"
          className="text-white/70 hover:text-amber-400 p-2 rounded-full transition-all duration-300 hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back to Home
        </Button>
      </Link>

      {/* Login Card Container */}
      <div
        className={`relative z-10 w-full flex justify-center transition-all duration-1000 ease-out ${fadeInClasses}`}
      >
        <Card className={glassCardClasses}>
          <CardHeader className="text-center p-0 mb-8">
            <CardTitle className="text-4xl font-serif font-bold tracking-wider text-white mb-2 leading-tight">
              Welcome Back
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Sign in to access bookings, track confirmations, and manage your
              rides.
            </p>
          </CardHeader>

          <CardContent className="p-0">
            {/* Google Login Button */}
            <Button
              onClick={handleGoogleSignIn}
              className="
                                w-full h-12 rounded-lg text-lg font-semibold
                                bg-amber-600 text-black hover:bg-amber-500/90 transition-all duration-300
                                hover:scale-[1.005] active:scale-[0.995]
                                shadow-lg shadow-amber-500/20 
                                hover:shadow-2xl hover:shadow-amber-500/40
                            "
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            {/* Fixed Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/60"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/40 px-4 text-gray-500 font-medium tracking-widest">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className={`pl-11 ${formInputClasses}`}
                  disabled
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Password"
                  className={`pl-11 ${formInputClasses}`}
                  disabled
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right pt-1">
                <a href="#" className={`text-xs ${goldText} font-medium`}>
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="
                                    w-full h-12 mt-6 rounded-lg text-lg font-semibold
                                    bg-black/50 border border-amber-400/50 text-amber-300 
                                    hover:bg-amber-500/10 hover:border-amber-400 transition-colors duration-300
                                "
                disabled
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
