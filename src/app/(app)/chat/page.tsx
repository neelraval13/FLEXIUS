// src/app/(app)/chat/page.tsx
import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserLLMConfig } from "@/db/queries/profile";
import ChatClient from "@/components/chat/chat-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Coach",
};

const ChatPage: React.FC = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const llmConfig = await getUserLLMConfig(session.user.id);

  return (
    <ChatClient provider={llmConfig.provider} hasOwnKey={!!llmConfig.apiKey} />
  );
};

export default ChatPage;
