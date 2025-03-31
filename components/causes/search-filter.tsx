import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { CauseCategory } from "@prisma/client";

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: CauseCategory | "ALL";
  onCategoryChange: (value: CauseCategory | "ALL") => void;
}

export function SearchFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search causes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          <SelectItem value="FOOD">Food</SelectItem>
          <SelectItem value="CLOTHING">Clothing</SelectItem>
          <SelectItem value="ACCESSORIES">Accessories</SelectItem>
          <SelectItem value="SERVICES">Services</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 