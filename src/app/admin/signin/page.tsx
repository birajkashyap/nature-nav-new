"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export default function AdminSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Important: We must specify the callbackUrl to keep them in the admin area
    const res = await signIn("admin-login", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid admin credentials");
    } else {
      router.push("/admin/profile");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-xl border border-yellow-600/20 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-yellow-600/10 rounded-full flex items-center justify-center border border-yellow-600/30">
            <Lock className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-white font-luxury tracking-wide">
            ADMIN PORTAL
          </h1>
          <p className="text-zinc-400 text-sm">Secure Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Admin Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-zinc-800 text-white focus:border-yellow-600/50"
              placeholder="admin@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-zinc-800 text-white focus:border-yellow-600/50"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
          >
            Access Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}
