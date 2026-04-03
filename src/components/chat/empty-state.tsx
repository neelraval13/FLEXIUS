import type React from "react";
import { Bot } from "lucide-react";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  "Generate a push day workout",
  "What did I do this week?",
  "Give me a leg day plan",
  "What's my bench press progress?",
  "Suggest a 30-min full body routine",
];

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
        <Bot className="text-primary size-8" />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">AI Coach</h2>
        <p className="text-muted-foreground text-sm">
          Your personal fitness assistant. Ask me anything about workouts,
          nutrition, or form — or let me generate a plan.
        </p>
      </div>
      <div className="flex max-w-sm flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestionClick(s)}
            className="bg-secondary hover:bg-secondary/80 rounded-full px-3 py-1.5 text-xs transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
