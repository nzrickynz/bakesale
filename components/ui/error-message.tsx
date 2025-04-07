import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  text?: string;
}

export function ErrorMessage({ text = "We're having trouble loading this. Please try again shortly." }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-gray-900">{text}</p>
    </div>
  );
} 