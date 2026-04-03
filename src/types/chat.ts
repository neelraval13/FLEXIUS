export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: GroundingSource[];
  imageUrl?: string;
}
