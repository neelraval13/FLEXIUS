// src/app/api/chat/route.ts
import type { Content, Part } from "@google/genai";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import ai, { GEMINI_MODEL } from "@/lib/gemini";
import {
  buildSystemPrompt,
  invalidatePromptCache,
} from "@/lib/build-system-prompt";
import { toolDeclarations, executeTool } from "@/lib/tools";
import { autoCompletePlanExercise } from "@/lib/plan-completion";
import type { ChatMessage, GroundingSource } from "@/types/chat";

const MAX_TOOL_ROUNDS = 10;

const WRITE_TOOLS = new Set([
  "logWorkout",
  "logBatchWorkouts",
  "saveWorkoutPlan",
]);

const LOG_TOOLS = new Set(["logWorkout", "logBatchWorkouts"]);

const toGeminiContents = (
  messages: ChatMessage[],
  imageBase64?: string | null,
  imageMimeType?: string | null,
): Content[] => {
  return messages.map((msg, index) => {
    const parts: Part[] = [];

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

const extractSources = (
  candidate: NonNullable<
    Awaited<ReturnType<typeof ai.models.generateContent>>["candidates"]
  >[number],
): GroundingSource[] => {
  const chunks = candidate.groundingMetadata?.groundingChunks ?? [];

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

export const POST = async (req: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { messages, imageBase64, imageMimeType } = (await req.json()) as {
      messages: ChatMessage[];
      imageBase64?: string | null;
      imageMimeType?: string | null;
    };

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const systemPrompt = await buildSystemPrompt({
      userId,
      name: session.user.name ?? "User",
    });

    const contents: Content[] = toGeminiContents(
      messages,
      imageBase64,
      imageMimeType,
    );

    let finalText = "";
    let sources: GroundingSource[] = [];
    let usedFunctionCalling = false;
    let mutated = false;

    // Phase 1: Function calling loop
    for (let i = 0; i < MAX_TOOL_ROUNDS; i++) {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ functionDeclarations: toolDeclarations }],
        },
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts;

      if (!parts?.length) {
        finalText = "Sorry, I couldn't generate a response. Please try again.";
        break;
      }

      const functionCalls = parts.filter((p) => p.functionCall);

      if (functionCalls.length === 0) {
        finalText = parts
          .map((p) => p.text)
          .filter(Boolean)
          .join("");
        break;
      }

      usedFunctionCalling = true;

      const functionResponseParts: Part[] = [];

      for (const part of functionCalls) {
        const { name, args } = part.functionCall!;

        if (!name) continue;

        const toolArgs = args as Record<string, unknown>;
        const result = await executeTool(name, toolArgs, userId);

        if (WRITE_TOOLS.has(name)) {
          mutated = true;
        }

        // Auto-mark plan exercise as completed after logging
        if (LOG_TOOLS.has(name)) {
          const marked = await autoCompletePlanExercise({
            userId,
            exerciseId: toolArgs.exerciseId as number,
            exerciseSource: toolArgs.source as string,
            performedAt:
              (toolArgs.performedAt as string) ||
              new Date().toLocaleDateString("en-CA", {
                timeZone: "Asia/Kolkata",
              }),
            planExerciseId: toolArgs.planExerciseId as number | undefined,
          });
          if (marked) {
            mutated = true;
          }
        }

        functionResponseParts.push({
          functionResponse: {
            name,
            response: result as unknown as Record<string, unknown>,
          },
        });
      }

      contents.push({ role: "model", parts: functionCalls });
      contents.push({ role: "user", parts: functionResponseParts });
    }

    // Phase 2: If no function calls were used, retry with
    // Google Search grounding for better general answers
    if (!usedFunctionCalling && finalText) {
      try {
        const searchResponse = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: toGeminiContents(messages, imageBase64, imageMimeType),
          config: {
            systemInstruction: systemPrompt,
            tools: [{ googleSearch: {} }],
          },
        });

        const searchCandidate = searchResponse.candidates?.[0];
        const searchParts = searchCandidate?.content?.parts;

        if (searchParts?.length) {
          const searchText = searchParts
            .map((p) => p.text)
            .filter(Boolean)
            .join("");

          if (searchText) {
            finalText = searchText;
          }
        }

        if (searchCandidate) {
          sources = extractSources(searchCandidate);
        }
      } catch {
        // Google Search grounding failed — use the original
        // function-calling response, which is already in finalText
      }
    }

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
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
};
