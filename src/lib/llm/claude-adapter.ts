// src/lib/llm/claude-adapter.ts

import type {
  LLMAdapter,
  LLMResponse,
  ChatMessage,
  ToolSchema,
} from "@/types/llm";
import { LLMProviderError } from "./errors";

const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 4096;

// ─── Anthropic API Types ─────────────────────────────────

interface AnthropicTextBlock {
  type: "text";
  text: string;
}

interface AnthropicToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface AnthropicToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

interface AnthropicImageBlock {
  type: "image";
  source: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

type AnthropicContentBlock =
  | AnthropicTextBlock
  | AnthropicToolUseBlock
  | AnthropicToolResultBlock
  | AnthropicImageBlock;

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
}

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  stop_reason: "end_turn" | "tool_use" | "max_tokens" | "stop_sequence";
}

// ─── Converters ──────────────────────────────────────────

const toAnthropicTools = (tools: ToolSchema[]): AnthropicTool[] => {
  // Claude uses standard JSON Schema for input_schema — pass through directly
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters,
  }));
};

const toAnthropicMessages = (
  messages: ChatMessage[],
  imageBase64?: string | null,
  imageMimeType?: string | null,
): AnthropicMessage[] => {
  return messages.map((msg, index) => {
    // Attach image to the last user message
    if (imageBase64 && msg.role === "user" && index === messages.length - 1) {
      const content: AnthropicContentBlock[] = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: imageMimeType || "image/jpeg",
            data: imageBase64,
          },
        },
        { type: "text", text: msg.content },
      ];
      return { role: msg.role, content };
    }

    return { role: msg.role, content: msg.content };
  });
};

// ─── Adapter Factory ─────────────────────────────────────

export const createClaudeAdapter = (
  apiKey: string,
  model?: string,
): LLMAdapter => {
  const CLAUDE_MODEL = model || DEFAULT_CLAUDE_MODEL;
  // Internal conversation state for multi-turn tool calling
  let conversationMessages: AnthropicMessage[] = [];

  const callAnthropic = async (
    messages: AnthropicMessage[],
    systemPrompt: string,
    tools: ToolSchema[],
  ): Promise<AnthropicResponse> => {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages,
        tools: toAnthropicTools(tools),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw LLMProviderError.fromResponse(
        "Anthropic",
        response.status,
        errorText,
      );
    }

    return response.json() as Promise<AnthropicResponse>;
  };

  const parseResponse = (response: AnthropicResponse): LLMResponse => {
    const textParts = response.content.filter(
      (b): b is AnthropicTextBlock => b.type === "text",
    );
    const toolUses = response.content.filter(
      (b): b is AnthropicToolUseBlock => b.type === "tool_use",
    );

    const text = textParts.map((b) => b.text).join("");

    if (toolUses.length > 0) {
      // Store the assistant's response (with tool_use blocks) for multi-turn
      conversationMessages.push({
        role: "assistant",
        content: response.content,
      });

      return {
        text,
        toolCalls: toolUses.map((b) => ({
          id: b.id,
          name: b.name,
          args: b.input,
        })),
      };
    }

    return { text, toolCalls: [] };
  };

  return {
    async chat(params) {
      conversationMessages = toAnthropicMessages(
        params.messages,
        params.imageBase64,
        params.imageMimeType,
      );

      const response = await callAnthropic(
        conversationMessages,
        params.systemPrompt,
        params.tools,
      );

      return parseResponse(response);
    },

    async continueWithToolResults(results, systemPrompt, tools) {
      // Append tool results as a user message with tool_result blocks
      const toolResultBlocks: AnthropicContentBlock[] = results.map((r) => ({
        type: "tool_result" as const,
        tool_use_id: r.id ?? "",
        content: JSON.stringify(r.result),
      }));

      conversationMessages.push({
        role: "user",
        content: toolResultBlocks,
      });

      const response = await callAnthropic(
        conversationMessages,
        systemPrompt,
        tools,
      );

      return parseResponse(response);
    },

    async searchGrounded(params) {
      // Claude doesn't have native search grounding.
      // Fall back to a regular chat call without tools.
      try {
        const messages = toAnthropicMessages(
          params.messages,
          params.imageBase64,
          params.imageMimeType,
        );

        const response = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": ANTHROPIC_VERSION,
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: MAX_TOKENS,
            system: params.systemPrompt,
            messages,
          }),
        });

        if (!response.ok) {
          return { text: "", sources: [] };
        }

        const data = (await response.json()) as AnthropicResponse;
        const text = data.content
          .filter((b): b is AnthropicTextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");

        return { text, sources: [] };
      } catch {
        return { text: "", sources: [] };
      }
    },

    reset() {
      conversationMessages = [];
    },
  };
};
