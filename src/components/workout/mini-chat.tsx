// src/components/workout/mini-chat.tsx
"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MessageBubble from "@/components/chat/message-bubble";
import TypingIndicator from "@/components/chat/typing-indicator";
import type { ChatMessage } from "@/types/chat";

interface MiniChatProps {
  planContext?: string;
}

const MiniChat: React.FC<MiniChatProps> = ({ planContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (planContext && history.length === 1) {
        history.unshift({
          role: "user" as const,
          content: `[CONTEXT — Do not repeat this back. The user is on their Today's Workout page. Here is their current plan:\n${planContext}\nAnswer questions in context of this plan. Be concise — this is a mini chat overlay. When the user asks to log an exercise from this plan, use the logWorkout or logBatchWorkouts tool with the corresponding planExerciseId so it gets marked as completed.]`,
        });
        history.splice(1, 0, {
          role: "assistant" as const,
          content: "Got it, I have your plan context. How can I help?",
        });
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.text,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      scrollToBottom();

      if (data.mutated) {
        router.refresh();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "Sorry, something went wrong. Try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, planContext, scrollToBottom, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto px-2.5 py-3"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center text-muted-foreground">
            <p className="text-xs">Ask your AI coach anything</p>
            <div className="flex flex-wrap justify-center gap-1">
              {[
                "Log my bench press",
                "Swap an exercise",
                "What weight next?",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setInput(chip)}
                  className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] transition-colors hover:bg-muted"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
            imageUrl={msg.imageUrl}
          />
        ))}

        {isLoading && <TypingIndicator />}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-2">
        <div className="flex items-end gap-1.5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your workout..."
            className="max-h-20 flex-1 resize-none text-sm!"
            rows={1}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="h-8 w-8 shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MiniChat;
