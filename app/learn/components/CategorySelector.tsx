import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import type { Category } from "../static/categories";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => (
  <div className="max-w-md mx-auto mb-4">
    {/* <label className="text-sm font-medium text-muted-foreground mb-2 block">
      Choose a category
    </label> */}
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div>
              <div className="font-medium">{category.name}</div>
              <div className="text-xs text-muted-foreground">
                {category.description}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default CategorySelector;
