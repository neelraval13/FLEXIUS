// src/lib/llm/gemini-adapter.ts

import { GoogleGenAI, Type, type FunctionDeclaration } from "@google/genai";
import type {
  LLMAdapter,
  LLMResponse,
  ChatMessage,
  ToolSchema,
  ToolParameter,
  GroundingSource,
} from "@/types/llm";
import { LLMProviderError } from "./errors";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// ─── JSON Schema → Gemini Format Converters ──────────────

const GEMINI_TYPE_MAP: Record<string, Type> = {
  string: Type.STRING,
  number: Type.NUMBER,
  boolean: Type.BOOLEAN,
  array: Type.ARRAY,
  object: Type.OBJECT,
};

const toGeminiParam = (param: ToolParameter): Record<string, unknown> => {
  const result: Record<string, unknown> = {
    type: GEMINI_TYPE_MAP[param.type] ?? "STRING",
  };
  if (param.description) result.description = param.description;
  if (param.enum) result.enum = param.enum;
  if (param.items) result.items = toGeminiParam(param.items);
  if (param.properties) {
    result.properties = Object.fromEntries(
      Object.entries(param.properties).map(([k, v]) => [k, toGeminiParam(v)]),
    );
  }
  if (param.required) result.required = param.required;
  return result;
};

const toGeminiFunctionDeclarations = (
  tools: ToolSchema[],
): FunctionDeclaration[] => {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: Type.OBJECT,
      properties: Object.fromEntries(
        Object.entries(tool.parameters.properties).map(([k, v]) => [
          k,
          toGeminiParam(v),
        ]),
      ),
      ...(tool.parameters.required?.length
        ? { required: tool.parameters.required }
        : {}),
    },
  }));
};

// ─── Message Conversion ──────────────────────────────────

interface GeminiPart {
  text?: string;
  inlineData?: { data: string; mimeType: string };
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

const messagesToGeminiContents = (
  messages: ChatMessage[],
  imageBase64?: string | null,
  imageMimeType?: string | null,
): GeminiContent[] => {
  return messages.map((msg, index) => {
    const parts: GeminiPart[] = [];

    // Attach image to the last user message
    if (imageBase64 && msg.role === "user" && index === messages.length - 1) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType || "image/jpeg",
        },
      });
    }

    parts.push({ text: msg.content });

    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts,
    };
  });
};

// ─── Source Extraction ────────────────────────────────────

const extractSources = (
  candidate: Record<string, unknown>,
): GroundingSource[] => {
  const meta = candidate.groundingMetadata as
    | { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> }
    | undefined;
  const chunks = meta?.groundingChunks ?? [];

  const seen = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const chunk of chunks) {
    const url = chunk.web?.uri;
    const title = chunk.web?.title;
    if (url && !seen.has(url)) {
      seen.add(url);
      sources.push({ title: title || url, url });
    }
  }

  return sources;
};

// ─── Adapter Factory ─────────────────────────────────────

export const createGeminiAdapter = (
  apiKey: string,
  model?: string,
): LLMAdapter => {
  const GEMINI_MODEL = model || DEFAULT_GEMINI_MODEL;
  const ai = new GoogleGenAI({ apiKey });

  // Internal multi-turn conversation state
  let contents: GeminiContent[] = [];

  const parseResponse = (
    response: Awaited<ReturnType<typeof ai.models.generateContent>>,
  ): LLMResponse => {
    const candidate = response.candidates?.[0];
    const parts = (candidate?.content?.parts ?? []) as GeminiPart[];

    if (parts.length === 0) {
      return { text: "", toolCalls: [] };
    }

    const functionCalls = parts.filter(
      (
        p,
      ): p is GeminiPart & {
        functionCall: NonNullable<GeminiPart["functionCall"]>;
      } => p.functionCall != null,
    );

    if (functionCalls.length === 0) {
      // Text-only response
      const text = parts
        .map((p) => p.text ?? "")
        .filter(Boolean)
        .join("");
      return { text, toolCalls: [] };
    }

    // Tool calls — store them in contents for the next round
    contents.push({
      role: "model",
      parts: functionCalls.map((p) => ({ functionCall: p.functionCall })),
    });

    return {
      text: "",
      toolCalls: functionCalls.map((p) => ({
        name: p.functionCall.name,
        args: p.functionCall.args,
      })),
    };
  };

  return {
    async chat(params) {
      // Start fresh conversation
      contents = messagesToGeminiContents(
        params.messages,
        params.imageBase64,
        params.imageMimeType,
      );

      let response;
      try {
        response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction: params.systemPrompt,
            tools: [
              {
                functionDeclarations: toGeminiFunctionDeclarations(
                  params.tools,
                ),
              },
            ],
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const status =
          msg.includes("401") || msg.includes("API_KEY")
            ? 401
            : msg.includes("429")
              ? 429
              : msg.includes("404")
                ? 404
                : 500;
        throw LLMProviderError.fromResponse("Gemini", status, msg);
      }

      return parseResponse(response);
    },

    async continueWithToolResults(results, systemPrompt, tools) {
      // Append tool results as functionResponse parts
      const responseParts: GeminiPart[] = results.map((r) => ({
        functionResponse: {
          name: r.name,
          response: r.result,
        },
      }));
      contents.push({ role: "user", parts: responseParts });

      let response;
      try {
        response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction: systemPrompt,
            tools: [
              { functionDeclarations: toGeminiFunctionDeclarations(tools) },
            ],
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const status =
          msg.includes("401") || msg.includes("API_KEY")
            ? 401
            : msg.includes("429")
              ? 429
              : msg.includes("404")
                ? 404
                : 500;
        throw LLMProviderError.fromResponse("Gemini", status, msg);
      }

      return parseResponse(response);
    },

    async searchGrounded(params) {
      try {
        const searchContents = messagesToGeminiContents(
          params.messages,
          params.imageBase64,
          params.imageMimeType,
        );

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: searchContents,
          config: {
            systemInstruction: params.systemPrompt,
            tools: [{ googleSearch: {} }],
          },
        });

        const candidate = response.candidates?.[0] as
          | Record<string, unknown>
          | undefined;
        const parts = ((
          candidate?.content as Record<string, unknown> | undefined
        )?.parts ?? []) as GeminiPart[];

        const text = parts
          .map((p) => p.text ?? "")
          .filter(Boolean)
          .join("");

        const sources = candidate ? extractSources(candidate) : [];

        return { text, sources };
      } catch {
        return { text: "", sources: [] };
      }
    },

    reset() {
      contents = [];
    },
  };
};
