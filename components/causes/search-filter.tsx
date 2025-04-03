'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function SearchFilter({
  search,
  onSearchChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-600" />
        <Input
          placeholder="Search causes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 text-gray-900 placeholder:text-gray-500"
        />
      </div>
    </div>
  );
} 