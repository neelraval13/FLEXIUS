import type React from "react";
import { Bot } from "lucide-react";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <div className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-full">
        <Bot className="text-primary size-4" />
      </div>
      <div className="bg-muted flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3">
        <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
        <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
        <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
      </div>
    </div>
  );
};

export default TypingIndicator;
