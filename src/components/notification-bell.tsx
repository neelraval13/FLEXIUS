// src/components/notification-bell.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PushState =
  | "loading"
  | "unsupported"
  | "denied"
  | "subscribed"
  | "unsubscribed";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
};

const NotificationBell: React.FC = () => {
  const [state, setState] = useState<PushState>("loading");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !VAPID_PUBLIC_KEY
    ) {
      setState("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setState(sub ? "subscribed" : "unsubscribed");
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY) return;
    setIsProcessing(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        setIsProcessing(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          .buffer as ArrayBuffer,
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (response.ok) {
        setState("subscribed");
      }
    } catch (error) {
      console.error("Push subscribe failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsProcessing(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        await subscription.unsubscribe();
      }

      setState("unsubscribed");
    } catch (error) {
      console.error("Push unsubscribe failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  if (state === "loading" || state === "unsupported") return null;

  const handleClick = () => {
    if (isProcessing) return;
    if (state === "subscribed") {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  const tooltipLabel =
    state === "denied"
      ? "Notifications blocked — enable in browser settings"
      : state === "subscribed"
        ? "Notifications on — tap to disable"
        : "Enable notifications";

  const srLabel =
    state === "subscribed" ? "Disable notifications" : "Enable notifications";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={isProcessing || state === "denied"}
            className={cn(state === "subscribed" && "text-primary")}
            aria-label={srLabel}
          />
        }
      >
        {isProcessing ? (
          <Loader2 className="size-5 animate-spin" />
        ) : state === "subscribed" ? (
          <BellRing className="size-5" />
        ) : state === "denied" ? (
          <BellOff className="size-5" />
        ) : (
          <Bell className="size-5" />
        )}
      </TooltipTrigger>
      <TooltipContent>{tooltipLabel}</TooltipContent>
    </Tooltip>
  );
};

export default NotificationBell;
