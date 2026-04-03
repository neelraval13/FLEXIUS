import type React from "react";
import { Globe } from "lucide-react";
import type { GroundingSource } from "@/types/chat";

interface GroundingSourcesProps {
  sources: GroundingSource[];
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 border-t border-current/10 pt-2">
      <p className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide">
        <Globe className="size-3" />
        Sources
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source) => {
          let domain: string;
          try {
            domain = new URL(source.url).hostname.replace("www.", "");
          } catch {
            domain = source.url;
          }

          return (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-background/50 hover:bg-background inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors"
              title={source.title}
            >
              <Globe className="size-2.5 shrink-0 opacity-60" />
              <span className="max-w-30 truncate">{domain}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default GroundingSources;
