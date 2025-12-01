"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      setStep("otp");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send verification code";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      // Redirect to the intended page
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid verification code";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-pink/30 to-bg-main flex flex-col">
      {/* Back button */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo/logo_circle.png"
                alt="Miran Army"
                width={80}
                height={80}
                className="mx-auto rounded-full shadow-lg"
              />
            </Link>
            <h1 className="font-heading text-2xl font-bold text-text-main mt-4">
              {step === "email" ? "Welcome to Miran Army!" : "Enter your code"}
            </h1>
            <p className="text-text-muted mt-2">
              {step === "email"
                ? "Sign in to save your favorite finds 💛"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-bg-elevated rounded-2xl p-6 md:p-8 shadow-xl border border-border-subtle">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Code
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">6-digit code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    disabled={isLoading}
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Verify & Sign In
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError(null);
                  }}
                  disabled={isLoading}
                >
                  Use a different email
                </Button>
              </form>
            )}
          </div>

          {/* Footer text */}
          <p className="text-xs text-text-muted text-center mt-6">
            No password needed! We&apos;ll send you a 6-digit code every time.
            Your favorites will be waiting for you 💛
          </p>
        </div>
      </div>
    </div>
  );
}
