import { Inbox } from "lucide-react";

interface EmptyStateProps {
  text?: string;
}

export function EmptyState({ text = "No items found" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4 text-center">
      <Inbox className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  );
} 