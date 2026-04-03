"use client";

import type React from "react";
import { useState, useCallback } from "react";
import type { ChatMessage } from "@/types/chat";
import MessageList from "@/components/chat/message-list";
import ChatInput from "@/components/chat/chat-input";
import EmptyState from "@/components/chat/empty-state";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:image/...;base64,XXXX"
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ChatClient: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

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

      // Prepare image data before clearing state
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
        // Strip imageUrl from messages sent to API
        // (not needed server-side, only for client display)
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

  return (
    <div className="flex h-full flex-col">
      {messages.length === 0 && !isLoading ? (
        <EmptyState onSuggestionClick={handleSuggestionClick} />
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
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
