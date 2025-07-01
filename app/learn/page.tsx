"use client";

import { useState, useEffect } from "react";
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

export const dynamic = "force-dynamic";

function ArticleCard({ article }: { article: Article }) {
  // Ensure tag_list is always an array
  const tags = Array.isArray(article.tag_list) ? article.tag_list : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
        {article.cover_image && (
          <div className="relative h-48 w-full">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              style={{ objectFit: "cover" }}
              className="bg-muted"
            />
          </div>
        )}
        <CardHeader>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            <CardTitle className="hover:text-primary transition-colors">
              {article.title}
            </CardTitle>
          </a>
          <div className="flex items-center text-sm text-muted-foreground pt-2">
            <Image
              src={article.user.profile_image_90}
              alt={article.user.name}
              width={24}
              height={24}
              className="rounded-full mr-2"
            />
            <span>{article.user.name}</span>
            <span className="mx-2">•</span>
            <span>{article.readable_publish_date}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {article.reading_time_minutes} min read
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LearnPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    setArticles([]); // Clear articles when category or tag changes
    setPage(1); // Reset to first page
    fetchArticles(1); // Fetch new articles
  }, [selectedCategory, selectedTag]);

  const fetchArticles = async (currentPage: number) => {
    setIsLoading(true);
    if (!selectedTag) {
      setIsLoading(false);
      return;
    }

    try {
      const perPage = 6;
      const response = await fetch(
        `https://dev.to/api/articles?tag=${selectedTag}&page=${currentPage}&per_page=${perPage}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }
      const newArticles: Article[] = await response.json();

      if (currentPage === 1) {
        setArticles(newArticles);
      } else {
        setArticles((prev) => [...prev, ...newArticles]);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsSearchMode(false);
    setSearchQuery("");
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
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-md mx-auto relative"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for topics (e.g., react, docker, algorithms)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
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
                    setSearchQuery(suggestion);
                    handleSearchSubmit(new Event("submit") as any);
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
