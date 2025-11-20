"use client";

import React, { useEffect, useState } from "react";
// Replaced next-auth/react and next/link with standard React/browser features to resolve import errors.
// Functionality is preserved using local functions and <a> tags.
// import { signIn } from "next-auth/react";
// import Link from "next/link";
// import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Lock, Chrome } from "lucide-react";
import { signIn } from "next-auth/react";

// Placeholder for a luxurious dark image. Replace with a high-res image of a black car or urban night.
const BACKGROUND_IMAGE_URL =
  "https://images.unsplash.com/photo-1594537180492-e2152862c93?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// Placeholder for next-auth's signIn function (Removed alert())
const placeholderSignIn = (provider: string) => {
  console.log(
    `Attempting to sign in with: ${provider}. (Real NextAuth signIn would execute here)`
  );
};

const LoginPage = () => {
  const [cardReady, setCardReady] = useState(false);

  // Simulating the GSAP fade-in using CSS class change after mount
  useEffect(() => {
    // This simulates the 'card fade-in' that GSAP was handling
    const timeout = setTimeout(() => {
      setCardReady(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Function to handle Google Sign-In
  const handleGoogleSignIn = () => {
    // Use the placeholder function instead of the imported next-auth signIn

    signIn("google", { callbackUrl: "/" });
  };

  // Custom dark/gold styling classes
  const goldText =
    "text-amber-300 hover:text-amber-200 transition-colors duration-300";
  const glassCardClasses = `
        bg-black/40 backdrop-blur-xl border border-gray-700/50 shadow-2xl
        rounded-2xl p-6 lg:p-8 w-full max-w-sm md:max-w-md
        transition-all duration-500
        sm:border-t sm:border-t-amber-400/50
    `;
  const formInputClasses = `
        bg-black/30 border-gray-700 placeholder:text-gray-500 text-white
        focus:ring-amber-400 focus:border-amber-400
        placeholder:text-sm
    `;

  // CSS to simulate the GSAP fade-in and the glow effect
  const fadeInClasses = cardReady
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-12";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Dark Vignette Overlay: Ensure this covers the background image */}
      <div className="absolute inset-0 bg-black/70 backdrop-brightness-[0.2] pointer-events-none"></div>

      {/* Floating Back Navigation - Using <a> instead of Link */}
      <a
        href="/"
        className="absolute top-6 left-6 z-20"
        aria-label="Back to Home"
      >
        <Button
          variant="ghost"
          className={`text-white/70 hover:text-amber-400 p-2 rounded-full transition-all duration-300 hover:bg-white/10`}
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back to Home
        </Button>
      </a>

      {/* Login Card Container */}
      <div
        className={`relative z-10 w-full sm:w-auto transition-all duration-1000 ease-out ${fadeInClasses}`}
      >
        <Card className={glassCardClasses}>
          <CardHeader className="text-center p-0 mb-6">
            <CardTitle
              className={`text-4xl font-serif font-bold tracking-wider text-white mb-2 leading-tight`}
            >
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
              className={`
                                w-full h-12 rounded-lg text-lg font-semibold
                                bg-amber-500/90 text-black hover:bg-amber-400 transition-all duration-300
                                hover:scale-[1.01] active:scale-[0.99]
                                /* Glow Effect Simulation using standard Tailwind classes */
                                shadow-none hover:shadow-[0_0_15px_rgba(255,215,0,0.6),0_0_30px_rgba(255,215,0,0.2)]
                            `}
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            {/* Separator Fix: Added whitespace-nowrap to prevent text wrapping/misalignment */}
            <div className="flex items-center my-8">
              <Separator className="flex-grow bg-gray-700/60" />
              <span className="mx-4 text-sm text-gray-500 font-medium tracking-wide whitespace-nowrap">
                OR CONTINUE WITH EMAIL
              </span>
              <Separator className="flex-grow bg-gray-700/60" />
            </div>

            {/* Email Login Form (Placeholder) */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  {/* Input Fix: Increased padding to pl-11 for better icon separation */}
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className={`pl-11 h-12 ${formInputClasses}`}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  {/* Input Fix: Increased padding to pl-11 for better icon separation */}
                  <Input
                    type="password"
                    placeholder="Password"
                    className={`pl-11 h-12 ${formInputClasses}`}
                    disabled
                  />
                </div>
                <div className="text-right">
                  {/* Using <a> instead of Link */}
                  <a href="#" className={`text-xs ${goldText}`}>
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                variant="outline"
                className={`
                                    w-full h-12 mt-4 rounded-lg text-lg font-semibold
                                    border-amber-400/50 text-amber-300 bg-transparent
                                    hover:bg-amber-500/10 hover:border-amber-400
                                `}
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
