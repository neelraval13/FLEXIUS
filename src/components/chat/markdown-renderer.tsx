import type React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="border-border mb-3 mt-5 border-b pb-1 text-lg font-bold first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-primary mb-2 mt-4 text-base font-bold first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-3 text-sm font-bold first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-2.5 leading-relaxed last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-3 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="text-foreground font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-muted-foreground italic">{children}</em>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className={`bg-background block overflow-x-auto rounded-md p-3 text-xs ${className}`}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mb-2.5 last:mb-0">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="border-primary/50 mb-2.5 border-l-2 pl-3 italic last:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="border-border mb-2.5 overflow-x-auto rounded-lg border last:mb-0">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-border bg-muted/50 border-b">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-1.5 text-left text-xs font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-border border-t px-3 py-1.5 text-xs">{children}</td>
  ),
  hr: () => <hr className="border-border my-4" />,
  a: ({ href, children }) => {
    const isInternal = href?.startsWith("/");
    return (
      <a
        href={href}
        {...(!isInternal && { target: "_blank", rel: "noopener noreferrer" })}
        className="text-primary underline underline-offset-2"
      >
        {children}
      </a>
    );
  },
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
