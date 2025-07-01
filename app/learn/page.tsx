"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { BookOpen, ExternalLink, Clock, User } from "lucide-react";
import { categories, type Category } from "./static/categories";
import { Article } from "./static/articleTypes";
import { useFetchArticlesApi } from "./api/useFetchArticlesApi";
import ArticleCard from "./components/ArticleCard";
import SearchBar from "./components/SearchBar";

export const dynamic = "force-dynamic";

export default function LearnPage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("frontend");
  const [selectedTag, setSelectedTag] = useState("react");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Get the current category object
  const currentCategory =
    categories.find((cat) => cat.id === selectedCategory) || categories[0];

  // Get all available tags for search
  const allTags = categories.flatMap((cat) => cat.tags);

  // Filter tags based on search query
  const filteredTags = currentCategory.tags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get search suggestions
  const searchSuggestions = allTags
    .filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  // Use the new hook
  const { articles, isLoading, error } = useFetchArticlesApi(
    selectedTag,
    page,
    6
  );

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsSearchMode(false);
    setSearchQuery("");
    setPage(1); // Reset page
    // Set the first tag of the new category as default
    const newCategory = categories.find((cat) => cat.id === categoryId);
    if (newCategory && newCategory.tags.length > 0) {
      setSelectedTag(newCategory.tags[0]);
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setIsSearchMode(false);
    setSearchQuery("");
    setPage(1); // Reset page
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.length > 0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Find if the search query matches any tag
      const matchingTag = allTags.find(
        (tag) => tag.toLowerCase() === searchQuery.toLowerCase()
      );

      if (matchingTag) {
        setSelectedTag(matchingTag);
        // Find which category this tag belongs to
        const categoryWithTag = categories.find((cat) =>
          cat.tags.includes(matchingTag)
        );
        if (categoryWithTag) {
          setSelectedCategory(categoryWithTag.id);
        }
      } else {
        // If no exact match, search for articles with the query as tag
        setSelectedTag(searchQuery.toLowerCase());
      }
      setIsSearchMode(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
          Learning Hub
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your daily dose of developer knowledge, curated from the community.
          Explore topics by category and find articles that match your
          interests.
        </p>
      </header>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onSearchSubmit={handleSearchSubmit}
          isSearchMode={isSearchMode}
          searchSuggestions={searchSuggestions}
          clearSearch={clearSearch}
        />
      </div>

      {/* Category Selection */}
      <div className="mb-6 p-6 bg-muted/50 rounded-lg">
        <div className="max-w-md mx-auto mb-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Choose a category
          </label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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

        {/* Tag Selection */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-3">{currentCategory.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {currentCategory.description}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {(isSearchMode ? filteredTags : currentCategory.tags).map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => handleTagSelect(tag)}
                className="capitalize text-sm"
                size="sm"
              >
                {tag}
              </Button>
            ))}
            {isSearchMode && filteredTags.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">
                No tags found matching &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </AnimatePresence>

      {isLoading && <p className="text-center mt-8">Loading articles...</p>}

      {!isLoading && articles.length > 0 && (
        <div className="text-center mt-8">
          <Button onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More Articles"}
          </Button>
        </div>
      )}

      {!isLoading && articles.length === 0 && selectedTag && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No articles found for &quot;{selectedTag}&quot;. Try selecting a
            different tag!
          </p>
        </div>
      )}
    </div>
  );
}
