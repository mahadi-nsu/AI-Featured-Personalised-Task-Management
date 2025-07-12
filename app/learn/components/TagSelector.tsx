import { Button } from "@/components/ui/button";
import React from "react";

interface TagSelectorProps {
  tags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  isSearchMode: boolean;
  filteredTags: string[];
  searchQuery: string;
  currentCategory: { name: string; description: string };
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTag,
  onTagSelect,
  isSearchMode,
  filteredTags,
  searchQuery,
  currentCategory,
}) => (
  <div className="text-center">
    <h3 className="text-lg font-semibold mb-3">{currentCategory.name}</h3>
    <p className="text-sm text-muted-foreground mb-4">
      {currentCategory.description}
    </p>
    <div className="flex flex-wrap justify-center gap-2">
      {(isSearchMode ? filteredTags : tags).map((tag) => (
        <Button
          key={tag}
          variant={selectedTag === tag ? "default" : "outline"}
          onClick={() => onTagSelect(tag)}
          className="capitalize text-sm"
          size="sm"
        >
          {tag}
        </Button>
      ))}
      {isSearchMode && filteredTags.length === 0 && (
        <p className="text-sm text-muted-foreground col-span-full">
          No tags found matching &quot;{searchQuery}&quot; , Still you can
          search!
        </p>
      )}
    </div>
  </div>
);

export default TagSelector;
