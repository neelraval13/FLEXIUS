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
    <div className="flex min-h-svh items-center justify-center bg-neutral-950 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-neutral-900 p-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Set up your fitness profile
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/30 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            autoComplete="username"
            className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 pr-10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          {password.length > 0 && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_REQUIREMENTS.map((req, i) => (
                <li
                  key={req.label}
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    requirementsMet[i] ? "text-green-400" : "text-red-400",
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
          <label className="text-sm text-neutral-400">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 pr-10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          {confirmPassword.length > 0 && (
            <p
              className={cn(
                "flex items-center gap-1.5 text-xs",
                passwordsMatch ? "text-green-400" : "text-red-400",
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

        <button
          type="submit"
          disabled={isPending || !allRequirementsMet || !passwordsMatch}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <UserPlus className="h-5 w-5" />
          )}
          Create Account
        </button>

        <p className="text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-400">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
