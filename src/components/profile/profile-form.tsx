// src/components/profile/profile-form.tsx

"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/app/actions/profile-actions";
import {
  Save,
  Loader2,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  Plug,
  Unplug,
  Check,
} from "lucide-react";
import { FITNESS_GOALS, GENDER_OPTIONS, LLM_PROVIDERS } from "@/types/profile";
import type { UserProfile } from "@/types/profile";

interface ProfileFormProps {
  profile: UserProfile | null;
}

const PROVIDER_LABELS: Record<string, string> = {
  gemini: "Gemini",
  claude: "Anthropic",
  openai: "OpenAI",
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isConnecting, startConnecting] = useTransition();
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(profile?.name ?? "");
  const [height, setHeight] = useState(profile?.height?.toString() ?? "");
  const [weight, setWeight] = useState(profile?.weight?.toString() ?? "");
  const [heightUnit, setHeightUnit] = useState(profile?.heightUnit ?? "cm");
  const [weightUnit, setWeightUnit] = useState(profile?.weightUnit ?? "kg");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitnessGoal ?? "");

  // AI Coach settings
  // "idle" = Flexius Intelligence (no custom key saved)
  // "configuring" = user is setting up their own key
  // "connected" = custom key is saved and active
  type CoachState = "idle" | "configuring" | "connected";

  const [coachState, setCoachState] = useState<CoachState>(
    profile?.llmApiKey ? "connected" : "idle",
  );
  const [llmProvider, setLlmProvider] = useState(
    profile?.llmProvider ?? "gemini",
  );
  const [llmApiKey, setLlmApiKey] = useState(profile?.llmApiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [justConnected, setJustConnected] = useState(false);

  // The provider label for display
  const connectedProviderLabel = PROVIDER_LABELS[llmProvider] ?? llmProvider;

  function handleSaveProfile() {
    startTransition(async () => {
      const result = await updateProfileAction({
        name: name.trim() || "User",
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        heightUnit,
        weightUnit,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        fitnessGoal: fitnessGoal || null,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  function handleConnect() {
    if (!llmApiKey.trim()) {
      setConnectError("Please enter your API key");
      return;
    }

    setConnectError(null);

    startConnecting(async () => {
      const result = await updateProfileAction({
        name: name.trim() || profile?.name || "User",
        height: height ? parseFloat(height) : (profile?.height ?? null),
        weight: weight ? parseFloat(weight) : (profile?.weight ?? null),
        heightUnit: heightUnit || profile?.heightUnit || "cm",
        weightUnit: weightUnit || profile?.weightUnit || "kg",
        llmProvider,
        llmApiKey: llmApiKey.trim(),
        llmModel: null,
      });

      if (result.success) {
        setCoachState("connected");
        setJustConnected(true);
        setTimeout(() => setJustConnected(false), 3000);
      } else {
        setConnectError(result.error ?? "Failed to save");
      }
    });
  }

  function handleDisconnect() {
    startConnecting(async () => {
      const result = await updateProfileAction({
        name: name.trim() || profile?.name || "User",
        height: height ? parseFloat(height) : (profile?.height ?? null),
        weight: weight ? parseFloat(weight) : (profile?.weight ?? null),
        heightUnit: heightUnit || profile?.heightUnit || "cm",
        weightUnit: weightUnit || profile?.weightUnit || "kg",
        llmProvider: "gemini",
        llmApiKey: null,
        llmModel: null,
      });

      if (result.success) {
        setCoachState("idle");
        setLlmProvider("gemini");
        setLlmApiKey("");
        setShowKey(false);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Personal Details */}
      <div className="space-y-4 rounded-2xl bg-neutral-900 p-4">
        <h2 className="text-lg font-semibold text-white">Your Details</h2>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">Height</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={heightUnit === "cm" ? "175" : "5.9"}
              step={heightUnit === "cm" ? "1" : "0.1"}
              className="flex-1 rounded-lg bg-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex rounded-lg bg-neutral-800 p-1">
              {["cm", "ft"].map((unit) => (
                <button
                  key={unit}
                  onClick={() => setHeightUnit(unit)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    heightUnit === unit
                      ? "bg-blue-600 text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">Weight</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={weightUnit === "kg" ? "70" : "154"}
              step="0.1"
              className="flex-1 rounded-lg bg-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex rounded-lg bg-neutral-800 p-1">
              {["kg", "lbs"].map((unit) => (
                <button
                  key={unit}
                  onClick={() => setWeightUnit(unit)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    weightUnit === unit
                      ? "bg-blue-600 text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">
            Date of Birth <span className="text-neutral-600">(optional)</span>
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">
            Gender <span className="text-neutral-600">(optional)</span>
          </label>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGender(gender === opt.value ? "" : opt.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  gender === opt.value
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fitness Goal */}
        <div className="space-y-1.5">
          <label className="text-sm text-neutral-400">Fitness Goal</label>
          <div className="flex flex-wrap gap-2">
            {FITNESS_GOALS.map((goal) => (
              <button
                key={goal.value}
                onClick={() =>
                  setFitnessGoal(fitnessGoal === goal.value ? "" : goal.value)
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  fitnessGoal === goal.value
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Profile */}
        <button
          onClick={handleSaveProfile}
          disabled={isPending || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      {/* AI Coach Settings */}
      <div className="space-y-4 rounded-2xl bg-neutral-900 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-white">AI Coach</h2>
        </div>

        {/* ── State: Flexius Intelligence (idle) ── */}
        {coachState === "idle" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-blue-600/10 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/20">
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  Flexius Intelligence
                </p>
                <p className="text-xs text-neutral-400">
                  Ready to go — no setup needed
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                ACTIVE
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCoachState("configuring")}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-neutral-700 px-4 py-3 transition-colors hover:border-neutral-500 hover:bg-neutral-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
                  <Key className="h-4 w-4 text-neutral-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-neutral-300">
                    Bring your own AI
                  </p>
                  <p className="text-xs text-neutral-500">
                    Use Claude, OpenAI, or your own Gemini key
                  </p>
                </div>
              </div>
              <span className="text-xs text-neutral-500">→</span>
            </button>
          </div>
        )}

        {/* ── State: Configuring ── */}
        {coachState === "configuring" && (
          <div className="space-y-4">
            {/* Back to Flexius */}
            <button
              type="button"
              onClick={() => {
                setCoachState("idle");
                setLlmProvider("gemini");
                setLlmApiKey("");
                setShowKey(false);
                setConnectError(null);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-neutral-700 px-4 py-3 transition-colors hover:bg-neutral-800/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
                <Sparkles className="h-4 w-4 text-neutral-500" />
              </div>
              <p className="text-sm text-neutral-300">
                ← Back to Flexius Intelligence
              </p>
            </button>

            {/* Provider picker */}
            <div className="space-y-1.5">
              <label className="text-sm text-neutral-400">Provider</label>
              <div className="flex gap-2">
                {LLM_PROVIDERS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setLlmProvider(p.value);
                      setLlmApiKey("");
                      setConnectError(null);
                    }}
                    className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      llmProvider === p.value
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-sm text-neutral-400">API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showKey ? "text" : "password"}
                  value={llmApiKey}
                  onChange={(e) => {
                    setLlmApiKey(e.target.value);
                    setConnectError(null);
                  }}
                  placeholder={
                    llmProvider === "claude"
                      ? "sk-ant-..."
                      : llmProvider === "openai"
                        ? "sk-..."
                        : "AIza..."
                  }
                  className="w-full rounded-lg bg-neutral-800 py-2.5 pl-9 pr-10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {connectError && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2">
                <p className="text-xs text-red-400">{connectError}</p>
              </div>
            )}

            {/* Connect button */}
            <button
              onClick={handleConnect}
              disabled={isConnecting || !llmApiKey.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plug className="h-5 w-5" />
              )}
              Connect
            </button>
          </div>
        )}

        {/* ── State: Connected ── */}
        {coachState === "connected" && (
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                justConnected ? "bg-emerald-500/10" : "bg-neutral-800"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  justConnected ? "bg-emerald-500/20" : "bg-neutral-700"
                }`}
              >
                {justConnected ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {justConnected
                    ? "Connected!"
                    : `Using your own ${connectedProviderLabel} intelligence`}
                </p>
                <p className="text-xs text-neutral-400">
                  {justConnected
                    ? `${connectedProviderLabel} is now your AI coach`
                    : "No rate limits · Pick models in chat"}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  justConnected
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {justConnected
                  ? "CONNECTED"
                  : connectedProviderLabel.toUpperCase()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isConnecting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 py-2.5 text-sm text-neutral-400 transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unplug className="h-4 w-4" />
              )}
              Disconnect — switch back to Flexius Intelligence
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
