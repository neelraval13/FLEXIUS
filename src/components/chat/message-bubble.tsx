import type React from "react";
import { Bot, User } from "lucide-react";
import Image from "next/image";
import type { GroundingSource } from "@/types/chat";
import MarkdownRenderer from "./markdown-renderer";
import GroundingSources from "./grounding-sources";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: GroundingSource[];
  imageUrl?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  sources,
  imageUrl,
}) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-start gap-3 px-4 py-2 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"
        }`}
      >
        {isUser ? (
          <User className="size-4" />
        ) : (
          <Bot className="text-primary size-4" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted rounded-tl-sm"
        }`}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Shared image"
            width={240}
            height={240}
            className="mb-2 max-h-60 w-auto rounded-lg object-contain"
            unoptimized
          />
        )}
        {content ? (
          isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <>
              <MarkdownRenderer content={content} />
              {sources && <GroundingSources sources={sources} />}
            </>
          )
        ) : null}
      </div>
    </div>
  );
};

export default MessageBubble;
