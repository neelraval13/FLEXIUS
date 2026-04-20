// src/lib/llm/openai-adapter.ts

import type {
  LLMAdapter,
  LLMResponse,
  ChatMessage,
  ToolSchema,
} from "@/types/llm";
import { LLMProviderError } from "./errors";

const DEFAULT_OPENAI_MODEL = "gpt-4o";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MAX_TOKENS = 4096;

// ─── OpenAI API Types ────────────────────────────────────

interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | OpenAIContentPart[] | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

interface OpenAIContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string; detail?: "auto" | "low" | "high" };
}

interface OpenAIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: OpenAIToolCall[];
      annotations?: Array<{
        type: string;
        url_citation?: { url: string; title: string };
      }>;
    };
    finish_reason: "stop" | "tool_calls" | "length" | "content_filter";
  }>;
}

// ─── Converters ──────────────────────────────────────────

const toOpenAITools = (tools: ToolSchema[]): OpenAITool[] => {
  return tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
};

const toOpenAIMessages = (
  systemPrompt: string,
  messages: ChatMessage[],
  imageBase64?: string | null,
  imageMimeType?: string | null,
): OpenAIMessage[] => {
  const result: OpenAIMessage[] = [{ role: "system", content: systemPrompt }];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (imageBase64 && msg.role === "user" && i === messages.length - 1) {
      const mimeType = imageMimeType || "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;
      result.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text", text: msg.content },
        ],
      });
    } else {
      result.push({ role: msg.role, content: msg.content });
    }
  }

  return result;
};

// ─── Adapter Factory ─────────────────────────────────────

export const createOpenAIAdapter = (
  apiKey: string,
  model?: string,
): LLMAdapter => {
  const OPENAI_MODEL = model || DEFAULT_OPENAI_MODEL;

  // Internal conversation state for multi-turn tool calling
  let conversationMessages: OpenAIMessage[] = [];

  const callOpenAI = async (
    messages: OpenAIMessage[],
    tools: ToolSchema[],
  ): Promise<OpenAIResponse> => {
    const body: Record<string, unknown> = {
      model: OPENAI_MODEL,
      max_tokens: MAX_TOKENS,
      messages,
    };

    if (tools.length > 0) {
      body.tools = toOpenAITools(tools);
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw LLMProviderError.fromResponse("OpenAI", response.status, errorText);
    }

    return response.json() as Promise<OpenAIResponse>;
  };

  const parseResponse = (response: OpenAIResponse): LLMResponse => {
    const choice = response.choices[0];
    if (!choice) return { text: "", toolCalls: [] };

    const message = choice.message;
    const text = message.content ?? "";
    const toolCalls = message.tool_calls ?? [];

    if (toolCalls.length > 0) {
      conversationMessages.push({
        role: "assistant",
        content: message.content,
        tool_calls: toolCalls,
      });

      return {
        text,
        toolCalls: toolCalls.map((tc) => {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.function.arguments);
          } catch {
            // malformed args — return empty
          }
          return {
            id: tc.id,
            name: tc.function.name,
            args,
          };
        }),
      };
    }

    return { text, toolCalls: [] };
  };

  return {
    async chat(params) {
      conversationMessages = toOpenAIMessages(
        params.systemPrompt,
        params.messages,
        params.imageBase64,
        params.imageMimeType,
      );

      const response = await callOpenAI(conversationMessages, params.tools);
      return parseResponse(response);
    },

    async continueWithToolResults(results, _systemPrompt, tools) {
      for (const r of results) {
        conversationMessages.push({
          role: "tool",
          tool_call_id: r.id ?? "",
          content: JSON.stringify(r.result),
        });
      }

      const response = await callOpenAI(conversationMessages, tools);
      return parseResponse(response);
    },

    async searchGrounded(params) {
      try {
        const messages = toOpenAIMessages(
          params.systemPrompt,
          params.messages,
          params.imageBase64,
          params.imageMimeType,
        );

        const response = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            max_tokens: MAX_TOKENS,
            messages,
            tools: [{ type: "web_search_preview" }],
          }),
        });

        if (!response.ok) {
          return { text: "", sources: [] };
        }

        const data = (await response.json()) as OpenAIResponse;
        const text = data.choices[0]?.message.content ?? "";

        // OpenAI includes search annotations in the message
        const annotations = data.choices[0]?.message.annotations;

        const sources = (annotations ?? [])
          .filter((a) => a.type === "url_citation" && a.url_citation)
          .map((a) => ({
            title: a.url_citation!.title,
            url: a.url_citation!.url,
          }));

        // Deduplicate
        const seen = new Set<string>();
        const uniqueSources = sources.filter((s) => {
          if (seen.has(s.url)) return false;
          seen.add(s.url);
          return true;
        });

        return { text, sources: uniqueSources };
      } catch {
        return { text: "", sources: [] };
      }
    },

    reset() {
      conversationMessages = [];
    },
  };
};
