// src/lib/llm/types.ts

/**
 * Provider-neutral types for the multi-LLM abstraction.
 *
 * All three providers (Gemini, Claude, OpenAI) support function calling
 * with JSON Schema tool definitions. The adapter translates between
 * this neutral format and each provider's wire format.
 *
 * The adapter is STATEFUL — it tracks the multi-turn conversation
 * internally for the tool-calling loop. Call reset() between
 * top-level user requests.
 */

// ─── Tool Schema (JSON Schema subset) ────────────────────

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
  required?: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

// ─── Tool Calls & Results ────────────────────────────────

export interface ToolCall {
  /** Provider-specific call ID (required by Claude and OpenAI) */
  id?: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  /** Must match the ToolCall.id for Claude and OpenAI */
  id?: string;
  name: string;
  result: Record<string, unknown>;
}

// ─── Sources (for search grounding) ─────────────────────

export interface GroundingSource {
  title: string;
  url: string;
}

// ─── Chat Message (user/assistant only) ─────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Adapter Response ───────────────────────────────────

export interface LLMResponse {
  /** Final text response (empty if the model only made tool calls) */
  text: string;
  /** Tool calls requested by the model */
  toolCalls: ToolCall[];
}

export interface LLMSearchResponse {
  text: string;
  sources: GroundingSource[];
}

// ─── Adapter Interface ──────────────────────────────────

export interface LLMAdapter {
  /**
   * Start a new conversation and get the model's first response.
   * May return tool calls, text, or both.
   */
  chat(params: {
    messages: ChatMessage[];
    systemPrompt: string;
    tools: ToolSchema[];
    imageBase64?: string | null;
    imageMimeType?: string | null;
  }): Promise<LLMResponse>;

  /**
   * Continue the conversation with tool execution results.
   * Call this after executing the tool calls from chat() or
   * a previous continueWithToolResults().
   */
  continueWithToolResults(
    results: ToolResult[],
    systemPrompt: string,
    tools: ToolSchema[],
  ): Promise<LLMResponse>;

  /**
   * Run a query with web search / grounding enabled.
   * Providers that don't support native search return a plain
   * chat response with empty sources.
   */
  searchGrounded(params: {
    messages: ChatMessage[];
    systemPrompt: string;
    imageBase64?: string | null;
    imageMimeType?: string | null;
  }): Promise<LLMSearchResponse>;

  /** Clear internal conversation state between top-level requests. */
  reset(): void;
}

/** Supported provider identifiers */
export type LLMProvider = "gemini" | "claude" | "openai";
