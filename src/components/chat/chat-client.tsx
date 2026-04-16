"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/types/chat";
import MessageList from "@/components/chat/message-list";
import ChatInput from "@/components/chat/chat-input";
import EmptyState from "@/components/chat/empty-state";

const STORAGE_KEY = "flexius-chat-history";
const MAX_STORED_MESSAGES = 50;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// localStorage helpers — stripped of imageUrl since blob URLs don't survive reloads
const loadStoredMessages = (): ChatMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveMessages = (messages: ChatMessage[]): void => {
  if (typeof window === "undefined") return;
  try {
    // Strip blob-URL image previews (they don't survive a reload) and cap size
    const sanitized = messages
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
        sources: msg.sources,
      }))
      .slice(-MAX_STORED_MESSAGES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // storage full or disabled — silently ignore
  }
};

const ChatClient: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Load saved history on mount
  useEffect(() => {
    const stored = loadStoredMessages();
    if (stored.length > 0) setMessages(stored);
  }, []);

  // Persist whenever messages change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleImageRemove = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
  }, [imagePreviewUrl]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed && !imageFile) return;
      if (isLoading) return;

      let imageBase64: string | null = null;
      let imageMimeType: string | null = null;
      const currentImageUrl = imagePreviewUrl;

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        imageMimeType = imageFile.type;
      }

      const userMessage: ChatMessage = {
        role: "user",
        content: trimmed || "Check this image",
        imageUrl: currentImageUrl ?? undefined,
      };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      setInput("");
      setImageFile(null);
      setImagePreviewUrl(null);
      setIsLoading(true);

      try {
        const apiMessages = updatedMessages.map(({ role, content: c }) => ({
          role,
          content: c,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            imageBase64,
            imageMimeType,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get response");
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.text,
          sources: data.sources?.length ? data.sources : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);

        const errorMessage: ChatMessage = {
          role: "assistant",
          content: "Sorry, I ran into an error. Please try again.",
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, imageFile, imagePreviewUrl],
  );

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage(suggestion);
    },
    [sendMessage],
  );

  const handleClearHistory = useCallback(() => {
    if (!confirm("Clear chat history? This can't be undone.")) return;
    setMessages([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      {messages.length === 0 && !isLoading ? (
        <EmptyState onSuggestionClick={handleSuggestionClick} />
      ) : (
        <>
          <div className="flex items-center justify-end border-b border-border px-4 py-2">
            <button
              onClick={handleClearHistory}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear history
            </button>
          </div>
          <MessageList messages={messages} isLoading={isLoading} />
        </>
      )}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        imageUrl={imagePreviewUrl}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
      />
    </div>
  );
};

export default ChatClient;
