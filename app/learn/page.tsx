"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Define the category structure
type Category = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

const categories: Category[] = [
  {
    id: "frontend",
    name: "Frontend Development",
    description: "React, Vue, Angular, and modern web technologies",
    tags: [
      "react",
      "vue",
      "angular",
      "nextjs",
      "nuxt",
      "typescript",
      "javascript",
      "css",
      "html",
      "tailwind",
      "svelte",
      "astro",
      "webpack",
      "vite",
      "styled-components",
      "sass",
      "less",
    ],
  },
  {
    id: "backend",
    name: "Backend Development",
    description: "Server-side programming and APIs",
    tags: [
      "node",
      "python",
      "java",
      "go",
      "rust",
      "php",
      "ruby",
      "express",
      "django",
      "fastapi",
      "spring",
      "gin",
      "laravel",
      "api",
      "rest",
      "graphql",
      "microservices",
      "serverless",
    ],
  },
  {
    id: "devops",
    name: "DevOps & Infrastructure",
    description: "Deployment, CI/CD, and cloud infrastructure",
    tags: [
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "gcp",
      "terraform",
      "jenkins",
      "github-actions",
      "gitlab-ci",
      "ansible",
      "nginx",
      "linux",
      "bash",
      "monitoring",
      "logging",
      "security",
    ],
  },
  {
    id: "databases",
    name: "Databases & Data Engineering",
    description: "Database design, SQL, and data processing",
    tags: [
      "postgresql",
      "mysql",
      "mongodb",
      "redis",
      "elasticsearch",
      "sql",
      "nosql",
      "data-engineering",
      "etl",
      "data-science",
      "big-data",
      "hadoop",
      "spark",
      "kafka",
      "airflow",
    ],
  },
  {
    id: "algorithms",
    name: "Data Structures & Algorithms",
    description: "Problem solving and algorithmic thinking",
    tags: [
      "algorithms",
      "data-structures",
      "leetcode",
      "competitive-programming",
      "dynamic-programming",
      "graph-algorithms",
      "sorting",
      "searching",
      "complexity",
      "optimization",
      "mathematics",
      "discrete-math",
    ],
  },
  {
    id: "mobile",
    name: "Mobile Development",
    description: "iOS, Android, and cross-platform development",
    tags: [
      "react-native",
      "flutter",
      "ios",
      "android",
      "swift",
      "kotlin",
      "mobile",
      "app-development",
      "xamarin",
      "ionic",
      "capacitor",
      "mobile-ui",
      "mobile-ux",
      "pwa",
      "hybrid-apps",
    ],
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Artificial intelligence and data science",
    tags: [
      "ai",
      "machine-learning",
      "deep-learning",
      "tensorflow",
      "pytorch",
      "scikit-learn",
      "nlp",
      "computer-vision",
      "neural-networks",
      "data-science",
      "python",
      "jupyter",
      "pandas",
      "numpy",
    ],
  },
  {
    id: "career",
    name: "Career & Productivity",
    description: "Professional development and productivity tips",
    tags: [
      "career",
      "productivity",
      "soft-skills",
      "leadership",
      "mentoring",
      "interview",
      "resume",
      "networking",
      "remote-work",
      "time-management",
      "learning",
      "growth",
      "motivation",
      "work-life-balance",
    ],
  },
  {
    id: "webdev",
    name: "Web Development",
    description: "General web development topics",
    tags: [
      "webdev",
      "programming",
      "coding",
      "development",
      "software-engineering",
      "best-practices",
      "clean-code",
      "testing",
      "debugging",
      "performance",
      "accessibility",
      "seo",
      "web-standards",
      "browser-compatibility",
    ],
  },
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
  const [selectedCategory, setSelectedCategory] = useState("frontend");
  const [selectedTag, setSelectedTag] = useState("react");

  // Get the current category object
  const currentCategory =
    categories.find((cat) => cat.id === selectedCategory) || categories[0];

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
    // Set the first tag of the new category as default
    const newCategory = categories.find((cat) => cat.id === categoryId);
    if (newCategory && newCategory.tags.length > 0) {
      setSelectedTag(newCategory.tags[0]);
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
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
            {currentCategory.tags.map((tag) => (
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
            No articles found for "{selectedTag}". Try selecting a different
            tag!
          </p>
        </div>
      )}
    </div>
  );
}
