// src/components/workout/plan-chat-bubble.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MiniChat from "./mini-chat";

interface PlanChatBubbleProps {
  planContext?: string;
}

const PlanChatBubble: React.FC<PlanChatBubbleProps> = ({ planContext }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat Widget */}
      {open && (
        <div className="fixed bottom-36 right-4 z-60 flex h-80 w-72 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:h-96 sm:w-80">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <h2 className="text-sm font-semibold">AI Coach</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <MiniChat planContext={planContext} />
          </div>
        </div>
      )}

      {/* FAB */}
      <Button
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-20 right-4 z-60 h-12 w-12 rounded-full shadow-lg shadow-primary/25"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </Button>
    </>
  );
};

export default PlanChatBubble;
