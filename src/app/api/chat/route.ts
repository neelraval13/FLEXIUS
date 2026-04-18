// src/app/api/chat/route.ts
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  buildSystemPrompt,
  invalidatePromptCache,
} from "@/lib/build-system-prompt";
import { executeTool } from "@/lib/tools";
import { autoCompletePlanExercise } from "@/lib/plan-completion";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUserTimezone } from "@/db/queries/profile";
import { getUserLLMConfig } from "@/db/queries/profile";
import { getTodayForTimezone } from "@/lib/user-timezone";
import { createLLMAdapter, toolSchemas } from "@/lib/llm";
import type { ChatMessage, GroundingSource } from "@/types/chat";
import type { ToolResult } from "@/lib/llm";
import { LLMProviderError } from "@/lib/llm/errors";

const MAX_TOOL_ROUNDS = 10;

const WRITE_TOOLS = new Set([
  "logWorkout",
  "logBatchWorkouts",
  "saveWorkoutPlan",
]);

const LOG_TOOLS = new Set(["logWorkout", "logBatchWorkouts"]);

export const POST = async (req: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user's LLM config early — needed for rate limit decision
  const llmConfig = await getUserLLMConfig(userId);
  const hasOwnKey = !!llmConfig.apiKey;

  // Rate limit only applies when using the server's Gemini key
  if (!hasOwnKey) {
    const rateCheck = checkRateLimit(`chat:${userId}`, 20);
    if (!rateCheck.allowed) {
      return Response.json(
        {
          error: "Too many requests. Please wait a moment.",
          retryAfterMs: rateCheck.resetInMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetInMs / 1000)),
          },
        },
      );
    }
  }

  const userTimezone = await getUserTimezone(userId);

  try {
    const {
      messages,
      imageBase64,
      imageMimeType,
      model: requestModel,
    } = (await req.json()) as {
      messages: ChatMessage[];
      imageBase64?: string | null;
      imageMimeType?: string | null;
      model?: string;
    };

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    // Get user's LLM provider and API key
    let adapter;
    try {
      adapter = createLLMAdapter(
        llmConfig.provider,
        llmConfig.apiKey,
        requestModel || llmConfig.model || undefined,
      );
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize AI provider",
        },
        { status: 400 },
      );
    }

    const systemPrompt = await buildSystemPrompt({
      userId,
      name: session.user.name ?? "User",
    });

    let finalText = "";
    let sources: GroundingSource[] = [];
    let usedFunctionCalling = false;
    let mutated = false;

    // Phase 1: Function calling loop
    let response = await adapter.chat({
      messages,
      systemPrompt,
      tools: toolSchemas,
      imageBase64,
      imageMimeType,
    });

    for (let i = 0; i < MAX_TOOL_ROUNDS; i++) {
      if (response.toolCalls.length === 0) {
        // No tool calls — we have the final text
        finalText = response.text;
        break;
      }

      usedFunctionCalling = true;

      // Execute all tool calls
      const toolResults: ToolResult[] = [];

      for (const toolCall of response.toolCalls) {
        const result = await executeTool(toolCall.name, toolCall.args, userId);

        if (WRITE_TOOLS.has(toolCall.name)) {
          mutated = true;
        }

        // Auto-mark plan exercise as completed after logging
        if (LOG_TOOLS.has(toolCall.name)) {
          const marked = await autoCompletePlanExercise({
            userId,
            exerciseId: toolCall.args.exerciseId as number,
            exerciseSource: toolCall.args.source as string,
            performedAt:
              (toolCall.args.performedAt as string) ||
              getTodayForTimezone(userTimezone),
            planExerciseId: toolCall.args.planExerciseId as number | undefined,
          });
          if (marked) {
            mutated = true;
          }
        }

        toolResults.push({
          id: toolCall.id,
          name: toolCall.name,
          result: result as unknown as Record<string, unknown>,
        });
      }

      // Feed results back and get next response
      response = await adapter.continueWithToolResults(
        toolResults,
        systemPrompt,
        toolSchemas,
      );
    }

    // If the loop ended without setting finalText (hit max rounds)
    if (!finalText && response.text) {
      finalText = response.text;
    }

    if (!finalText) {
      finalText = "Sorry, I couldn't generate a response. Please try again.";
    }

    // Phase 2: If no function calls were used, retry with
    // search grounding for better general answers
    if (!usedFunctionCalling) {
      const searchResult = await adapter.searchGrounded({
        messages,
        systemPrompt,
        imageBase64,
        imageMimeType,
      });

      if (searchResult.text) {
        finalText = searchResult.text;
      }
      sources = searchResult.sources;
    }

    // Clean up adapter state
    adapter.reset();

    // Revalidate affected pages so router.refresh() gets fresh data
    if (mutated) {
      invalidatePromptCache(userId);
      revalidatePath("/workout/today");
      revalidatePath("/history");
      revalidatePath("/");
    }

    return Response.json({ text: finalText, sources, mutated });
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof LLMProviderError) {
      return Response.json(
        { error: error.userMessage },
        { status: error.statusCode === 429 ? 429 : 400 },
      );
    }

    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
};
