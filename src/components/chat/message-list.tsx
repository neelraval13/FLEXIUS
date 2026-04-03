"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import MessageBubble from "./message-bubble";
import TypingIndicator from "./typing-indicator";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto py-4">
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
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
