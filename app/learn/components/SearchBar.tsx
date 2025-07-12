import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import React from "react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  isSearchMode: boolean;
  searchSuggestions: string[];
  clearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isSearchMode,
  searchSuggestions,
  clearSearch,
}) => (
  <div className="mb-4">
    <form onSubmit={onSearchSubmit} className="max-w-md mx-auto relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for topics (e.g., react, docker, algorithms)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {/* Search Suggestions */}
      {isSearchMode && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1">
          {searchSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                onSearchChange(suggestion);
                onSearchSubmit(new Event("submit") as any);
              }}
              className="w-full text-left px-4 py-2 hover:bg-muted focus:bg-muted focus:outline-none"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </form>
  </div>
);

export default SearchBar;
