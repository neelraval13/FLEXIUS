"use client";

import type React from "react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ImagePlus, Mic, MicOff } from "lucide-react";
import ImagePreview from "@/components/chat/image-preview";
import { useVoiceInput } from "@/lib/use-voice-input";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  imageUrl: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  imageUrl,
  onImageSelect,
  onImageRemove,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, isSupported, transcript, toggleListening } =
    useVoiceInput({
      onTranscript: (text) => {
        onChange(value ? `${value} ${text}` : text);
      },
    });

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    adjustHeight();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be under 10MB");
      return;
    }

    onImageSelect(file);
    e.target.value = "";
  };

  const canSend = (value.trim().length > 0 || !!imageUrl) && !isLoading;
  const displayValue =
    isListening && transcript ? `${value} ${transcript}`.trim() : value;

  return (
    <div className="border-t border-border bg-background p-3">
      {isListening && (
        <div className="mb-2 flex items-center justify-center gap-2 text-xs text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {transcript ? `"${transcript}"` : "Listening..."}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-2xl bg-muted px-3 py-2">
        {imageUrl && (
          <div className="mb-1 w-full">
            <ImagePreview imageUrl={imageUrl} onRemove={onImageRemove} />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <ImagePlus className="size-4" />
        </Button>
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={handleInput}
          placeholder="Ask your Flexius coach..."
          rows={1}
          className="max-h-40 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder-muted-foreground outline-none"
        />
        {isSupported && (
          <Button
            size="icon"
            variant="ghost"
            className={`size-8 shrink-0 rounded-full ${isListening ? "text-primary bg-primary/10" : ""}`}
            onClick={toggleListening}
            disabled={isLoading}
          >
            {isListening ? (
              <MicOff className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
          </Button>
        )}
        <Button
          size="icon"
          className="size-8 shrink-0 rounded-full"
          onClick={onSend}
          disabled={!canSend}
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        AI can make mistakes. Verify important fitness advice.
      </p>
    </div>
  );
};

export default ChatInput;
