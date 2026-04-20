// src/components/install-prompt.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "flexius-install-dismissed";

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if user dismissed recently (24h cooldown)
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < oneDayMs) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-100 mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <Card className="flex-row items-start gap-3 rounded-xl p-4 shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Install Flexius
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add to your home screen for quick access at the gym.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0"
        >
          <X className="size-4" />
        </Button>
      </Card>
    </div>
  );
};

export default InstallPrompt;
