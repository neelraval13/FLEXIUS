// src/lib/llm/errors.ts

/**
 * Structured error for LLM provider failures.
 * Gives the chat route enough context to return
 * a user-friendly message.
 */
export class LLMProviderError extends Error {
  constructor(
    public readonly provider: string,
    public readonly statusCode: number,
    public readonly userMessage: string,
    public readonly rawError?: string,
  ) {
    super(`${provider} API error (${statusCode}): ${userMessage}`);
    this.name = "LLMProviderError";
  }

  /**
   * Parse an HTTP error response into a user-friendly message.
   */
  static fromResponse(
    provider: string,
    status: number,
    errorBody: string,
  ): LLMProviderError {
    let userMessage: string;

    switch (status) {
      case 401:
      case 403:
        userMessage =
          "Your API key is invalid or has been revoked. Check your key in Profile → AI Coach.";
        break;
      case 402:
        userMessage = `Your ${provider} account has insufficient credits. Add billing details at your provider's dashboard.`;
        break;
      case 429:
        userMessage = `${provider} rate limit reached. Wait a moment and try again, or upgrade your plan.`;
        break;
      case 404:
        userMessage =
          "The selected model was not found. It may have been deprecated — try switching to a different model.";
        break;
      case 400: {
        // Try to extract a meaningful message from the error body
        const lower = errorBody.toLowerCase();
        if (lower.includes("api key") || lower.includes("api_key")) {
          userMessage =
            "Your API key format appears incorrect. Check your key in Profile → AI Coach.";
        } else if (lower.includes("model")) {
          userMessage =
            "The selected model is not available with your API key. Try a different model.";
        } else {
          userMessage = `${provider} rejected the request. This might be a temporary issue — try again.`;
        }
        break;
      }
      case 500:
      case 502:
      case 503:
        userMessage = `${provider} is experiencing issues. Try again in a few moments.`;
        break;
      default:
        userMessage = `${provider} returned an unexpected error (${status}). Try again or switch providers.`;
    }

    return new LLMProviderError(provider, status, userMessage, errorBody);
  }
}
