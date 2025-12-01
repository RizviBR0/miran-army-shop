"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success - redirect to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-yellow mb-4">
            <Image
              src="/logo/logo_circle.png"
              alt="Miran Army"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Admin Login
          </h1>
          <p className="text-gray-400 mt-2">
            Enter your credentials to access the dashboard
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-bg-elevated rounded-2xl p-6 md:p-8 shadow-xl"
        >
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@miranarmy.store"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Not an admin?{" "}
          <a href="/" className="text-brand-yellow hover:underline">
            Go to homepage
          </a>
        </p>
      </div>
    </div>
  );
}
