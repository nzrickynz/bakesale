'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CauseCard } from "@/components/causes/cause-card";
import { SearchFilter } from "@/components/causes/search-filter";
import { Cause, Listing, User } from "@prisma/client";
import { useDebounce } from "@/hooks/use-debounce";

interface CausesClientProps {
  causes: (Cause & {
    listings: (Listing & { volunteer: User })[];
  })[];
  initialSearch: string;
}

export function CausesClient({ causes, initialSearch }: CausesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    
    router.push(`/causes?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  return (
    <>
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {causes?.map((cause) => (
          <CauseCard key={cause.id} cause={cause} />
        ))}
      </div>
    </>
  );
} 