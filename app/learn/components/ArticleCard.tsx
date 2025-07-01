import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "../types/articleTypes.js";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
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
            {tags.map((tag: string) => (
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
};

export default ArticleCard;
