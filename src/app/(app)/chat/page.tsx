// src/app/(app)/chat/page.tsx
import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ChatClient from "@/components/chat/chat-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Coach",
};

const ChatPage: React.FC = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <ChatClient />;
};

export default ChatPage;
