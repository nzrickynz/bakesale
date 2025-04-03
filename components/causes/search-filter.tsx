'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface SearchFilterProps {
  search?: string;
}

export function SearchFilter({
  search = "",
}: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/causes?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search causes..."
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
} 