// src/components/auth/register-form.tsx

"use client";

import type React from "react";
import { useState, useTransition, useMemo } from "react";
import { registerAction } from "@/app/actions/auth-actions";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  {
    label: "One special character (!@#$%^&*)",
    test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirementsMet = useMemo(
    () => PASSWORD_REQUIREMENTS.map((req) => req.test(password)),
    [password],
  );

  const allRequirementsMet = requirementsMet.every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allRequirementsMet) {
      setError("Password doesn't meet all requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords don't match");
      return;
    }

    startTransition(async () => {
      const result = await registerAction({ username, password, name });

      if (!result.success) {
        setError(result.error || "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
    });
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm rounded-2xl">
        <CardContent className="space-y-4 py-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Create Account
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your fitness profile
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                autoComplete="username"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="h-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>

              {password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {PASSWORD_REQUIREMENTS.map((req, i) => (
                    <li
                      key={req.label}
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        requirementsMet[i]
                          ? "text-emerald-500"
                          : "text-destructive",
                      )}
                    >
                      {requirementsMet[i] ? (
                        <Check className="h-3 w-3 shrink-0" />
                      ) : (
                        <X className="h-3 w-3 shrink-0" />
                      )}
                      {req.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="h-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>

              {confirmPassword.length > 0 && (
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    passwordsMatch ? "text-emerald-500" : "text-destructive",
                  )}
                >
                  {passwordsMatch ? (
                    <Check className="h-3 w-3 shrink-0" />
                  ) : (
                    <X className="h-3 w-3 shrink-0" />
                  )}
                  {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending || !allRequirementsMet || !passwordsMatch}
              className="h-10 w-full rounded-xl text-sm font-semibold"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Create Account
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
