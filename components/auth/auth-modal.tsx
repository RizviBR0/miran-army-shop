"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
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

      onSuccess?.();
      onClose();
      // Refresh the page to update auth state
      window.location.reload();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid verification code";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setOtp("");
    setStep("email");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-yellow" />
            {step === "email" ? "Sign in to Miran Army" : "Enter your code"}
          </DialogTitle>
          <DialogDescription>
            {step === "email"
              ? "We'll send you a 6-digit code to sign in – no password needed!"
              : `We sent a 6-digit code to ${email}`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-email">Email address</Label>
              <Input
                id="modal-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send Code
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-otp">6-digit code</Label>
              <Input
                id="modal-otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                disabled={isLoading}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full"
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

        <p className="text-xs text-text-muted text-center">
          By signing in, you agree to save your favorites and receive occasional
          updates from Miran Army.
        </p>
      </DialogContent>
    </Dialog>
  );
}
