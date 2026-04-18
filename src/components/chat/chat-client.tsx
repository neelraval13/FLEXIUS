"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/types/chat";
import { LLM_MODELS } from "@/types/profile";
import MessageList from "@/components/chat/message-list";
import ChatInput from "@/components/chat/chat-input";
import EmptyState from "@/components/chat/empty-state";

const STORAGE_KEY = "flexius-chat-history";
const MODEL_STORAGE_KEY = "flexius-chat-model";
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
    const sanitized = messages
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
        sources: msg.sources,
      }))
      .slice(-MAX_STORED_MESSAGES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // storage full or disabled
  }
};

const getDefaultModel = (provider: string): string => {
  const models = LLM_MODELS[provider];
  return models?.[0]?.value ?? "gemini-2.5-flash";
};

const loadStoredModel = (provider: string): string => {
  if (typeof window === "undefined") return getDefaultModel(provider);
  try {
    const stored = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (!stored) return getDefaultModel(provider);
    // Verify the stored model belongs to the current provider
    const models = LLM_MODELS[provider] ?? [];
    if (models.some((m) => m.value === stored)) return stored;
    return getDefaultModel(provider);
  } catch {
    return getDefaultModel(provider);
  }
};

interface ChatClientProps {
  provider: string;
  hasOwnKey: boolean;
}

const ChatClient: React.FC<ChatClientProps> = ({ provider, hasOwnKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [model, setModel] = useState(() => loadStoredModel(provider));

  // Load saved history on mount
  useEffect(() => {
    const stored = loadStoredMessages();
    if (stored.length > 0) setMessages(stored);
  }, []);

  // Persist messages
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Persist model selection
  const handleModelChange = useCallback(
    (newModel: string) => {
      if (
        messages.length > 0 &&
        !confirm("Switching models will clear your chat history. Continue?")
      ) {
        return;
      }

      setModel(newModel);
      setMessages([]);

      try {
        window.localStorage.setItem(MODEL_STORAGE_KEY, newModel);
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    },
    [messages.length],
  );

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
            model,
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
    [messages, isLoading, imageFile, imagePreviewUrl, model],
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
        provider={hasOwnKey ? provider : null}
        model={model}
        onModelChange={handleModelChange}
      />
    </div>
  );
};

export default ChatClient;
