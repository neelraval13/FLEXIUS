// src/lib/llm/index.ts

import type { LLMAdapter, LLMProvider } from "@/types/llm";
import { createGeminiAdapter } from "./gemini-adapter";
import { createClaudeAdapter } from "./claude-adapter";
import { createOpenAIAdapter } from "./openai-adapter";

export type { LLMAdapter, LLMProvider } from "@/types/llm";
export type {
  ChatMessage,
  ToolSchema,
  ToolCall,
  ToolResult,
  GroundingSource,
  LLMResponse,
  LLMSearchResponse,
} from "@/types/llm";
export { toolSchemas } from "./tool-schemas";

/**
 * Auto-detect LLM provider from an API key's prefix.
 * Returns null if the key format isn't recognized.
 */
export const detectProviderFromKey = (apiKey: string): LLMProvider | null => {
  if (apiKey.startsWith("sk-ant-")) return "claude";
  if (apiKey.startsWith("sk-")) return "openai";
  if (apiKey.startsWith("AIza")) return "gemini";
  return null;
};

/**
 * Create an LLM adapter for the given provider.
 *
 * If the user hasn't set a custom API key, falls back to
 * Gemini with the server's GEMINI_API_KEY env var.
 */
export const createLLMAdapter = (
  provider: LLMProvider | string,
  userApiKey: string | null,
  model?: string,
): LLMAdapter => {
  // Auto-detect provider from key if user hasn't explicitly chosen one
  const resolvedProvider =
    userApiKey && provider === "gemini"
      ? (detectProviderFromKey(userApiKey) ?? provider)
      : provider;
  switch (resolvedProvider) {
    case "claude": {
      if (!userApiKey) {
        throw new Error(
          "Claude requires an API key. Add your Anthropic API key in Profile → Settings.",
        );
      }
      return createClaudeAdapter(userApiKey, model);
    }

    case "openai": {
      if (!userApiKey) {
        throw new Error(
          "OpenAI requires an API key. Add your OpenAI API key in Profile → Settings.",
        );
      }
      return createOpenAIAdapter(userApiKey, model);
    }

    case "gemini":
    default: {
      // Gemini uses the user's key if provided, otherwise the server's key
      const apiKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
      }
      return createGeminiAdapter(apiKey, model);
    }
  }
};
