// src/components/profile/profile-form.tsx

"use client";

import { useState, useTransition } from "react";
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
  ChevronRight,
} from "lucide-react";

import { updateProfileAction } from "@/app/actions/profile-actions";
import { FITNESS_GOALS, GENDER_OPTIONS, LLM_PROVIDERS } from "@/types/profile";
import type { UserProfile } from "@/types/profile";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

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
      <Card className="rounded-2xl">
        <CardContent className="space-y-4 py-2">
          <h2 className="text-lg font-semibold">Your Details</h2>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-sm">
              Name
            </Label>
            <Input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-10"
            />
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-height" className="text-sm">
              Height
            </Label>
            <div className="flex gap-2">
              <Input
                id="profile-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={heightUnit === "cm" ? "175" : "5.9"}
                step={heightUnit === "cm" ? "1" : "0.1"}
                className="h-10 flex-1"
              />
              <ToggleGroup
                value={[heightUnit]}
                onValueChange={(values) => {
                  const next = values[0];
                  if (next) setHeightUnit(next);
                }}
              >
                {["cm", "ft"].map((unit) => (
                  <ToggleGroupItem
                    key={unit}
                    value={unit}
                    aria-label={`Use ${unit}`}
                  >
                    {unit}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-weight" className="text-sm">
              Weight
            </Label>
            <div className="flex gap-2">
              <Input
                id="profile-weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={weightUnit === "kg" ? "70" : "154"}
                step="0.1"
                className="h-10 flex-1"
              />
              <ToggleGroup
                value={[weightUnit]}
                onValueChange={(values) => {
                  const next = values[0];
                  if (next) setWeightUnit(next);
                }}
              >
                {["kg", "lbs"].map((unit) => (
                  <ToggleGroupItem
                    key={unit}
                    value={unit}
                    aria-label={`Use ${unit}`}
                  >
                    {unit}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-dob" className="text-sm">
              Date of Birth{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="profile-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              Gender <span className="text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={gender === opt.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() =>
                    setGender(gender === opt.value ? "" : opt.value)
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-1.5">
            <Label className="text-sm">Fitness Goal</Label>
            <div className="flex flex-wrap gap-2">
              {FITNESS_GOALS.map((goal) => (
                <Button
                  key={goal.value}
                  type="button"
                  variant={fitnessGoal === goal.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() =>
                    setFitnessGoal(fitnessGoal === goal.value ? "" : goal.value)
                  }
                >
                  {goal.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Save Profile */}
          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={isPending || !name.trim()}
            className="h-11 w-full rounded-xl text-sm font-semibold"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Save className="size-5" />
            )}
            {saved ? "Saved!" : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* AI Coach Settings */}
      <Card className="rounded-2xl">
        <CardContent className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Coach</h2>
          </div>

          {/* ── State: Flexius Intelligence (idle) ── */}
          {coachState === "idle" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Flexius Intelligence</p>
                  <p className="text-xs text-muted-foreground">
                    Ready to go — no setup needed
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ACTIVE
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setCoachState("configuring")}
                className="h-auto w-full justify-between rounded-xl border-dashed px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Key className="size-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Bring your own AI</p>
                    <p className="text-xs text-muted-foreground">
                      Use Claude, OpenAI, or your own Gemini key
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Button>
            </div>
          )}

          {/* ── State: Configuring ── */}
          {coachState === "configuring" && (
            <div className="space-y-4">
              {/* Back to Flexius */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCoachState("idle");
                  setLlmProvider("gemini");
                  setLlmApiKey("");
                  setShowKey(false);
                  setConnectError(null);
                }}
                className="h-auto w-full justify-start gap-3 rounded-xl px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Sparkles className="size-4 text-muted-foreground" />
                </div>
                <span className="text-sm">← Back to Flexius Intelligence</span>
              </Button>

              {/* Provider picker */}
              <div className="space-y-1.5">
                <Label className="text-sm">Provider</Label>
                <div className="flex gap-2">
                  {LLM_PROVIDERS.map((p) => (
                    <Button
                      key={p.value}
                      type="button"
                      variant={
                        llmProvider === p.value ? "default" : "secondary"
                      }
                      onClick={() => {
                        setLlmProvider(p.value);
                        setLlmApiKey("");
                        setConnectError(null);
                      }}
                      className="h-10 flex-1 rounded-lg text-sm font-medium"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <Label htmlFor="llm-api-key" className="text-sm">
                  API Key
                </Label>
                <div className="relative">
                  <Key className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="llm-api-key"
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
                    className="h-10 pl-9 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                  >
                    {showKey ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error message */}
              {connectError && (
                <Alert variant="destructive">
                  <AlertDescription>{connectError}</AlertDescription>
                </Alert>
              )}

              {/* Connect button */}
              <Button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting || !llmApiKey.trim()}
                className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {isConnecting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Plug className="size-5" />
                )}
                Connect
              </Button>
            </div>
          )}

          {/* ── State: Connected ── */}
          {coachState === "connected" && (
            <div className="space-y-3">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3",
                  justConnected ? "bg-emerald-500/10" : "bg-muted",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    justConnected
                      ? "bg-emerald-500/20"
                      : "bg-muted-foreground/10",
                  )}
                >
                  {justConnected ? (
                    <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Sparkles className="size-4 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {justConnected
                      ? "Connected!"
                      : `Using your own ${connectedProviderLabel} intelligence`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {justConnected
                      ? `${connectedProviderLabel} is now your AI coach`
                      : "No rate limits · Pick models in chat"}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    justConnected
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-primary/20 text-primary",
                  )}
                >
                  {justConnected
                    ? "CONNECTED"
                    : connectedProviderLabel.toUpperCase()}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                disabled={isConnecting}
                className="h-10 w-full rounded-xl text-sm text-muted-foreground hover:border-destructive/50 hover:text-destructive"
              >
                {isConnecting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Unplug className="size-4" />
                )}
                Disconnect — switch back to Flexius Intelligence
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
