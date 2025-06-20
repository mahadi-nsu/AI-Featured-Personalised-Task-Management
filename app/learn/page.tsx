"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Define the type for a dev.to article
type Article = {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  readable_publish_date: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  user: {
    name: string;
    profile_image_90: string;
  };
};

const availableTags = [
  "javascript",
  "react",
  "nextjs",
  "typescript",
  "css",
  "html",
  "node",
  "python",
  "go",
  "rust",
  "webdev",
  "ai",
  "machinelearning",
  "gamedev",
  "mobile",
  "career",
  "productivity",
  "discuss",
];

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
  const [selectedTags, setSelectedTags] = useState(["react"]);

  useEffect(() => {
    setArticles([]); // Clear articles when tags change
    setPage(1); // Reset to first page
    fetchArticles(1); // Fetch new articles
  }, [selectedTags]);

  const fetchArticles = async (currentPage: number) => {
    setIsLoading(true);
    // Use only the first selected tag since dev.to API doesn't support multiple tags
    const selectedTag = selectedTags[0];
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

      // Debug: Log the first article to see the actual structure
      if (newArticles.length > 0) {
        console.log("First article structure:", newArticles[0]);
      }

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

  const selectTag = (tag: string) => {
    setSelectedTags([tag]);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
          Learning Hub
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your daily dose of developer knowledge, curated from the community.
          Select a topic you're interested in to get started.
        </p>
      </header>

      <div className="mb-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-center">
          What are you interested in?
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Select one topic to explore articles
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {availableTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              onClick={() => selectTag(tag)}
              className="capitalize"
            >
              {tag}
            </Button>
          ))}
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

      {!isLoading && articles.length === 0 && selectedTags.length > 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No articles found for the selected topic. Try selecting a different
            tag!
          </p>
        </div>
      )}
    </div>
  );
}
