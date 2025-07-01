import { useState, useEffect } from "react";
import type { Article } from "../static/articleTypes.ts";

export function useFetchArticlesApi(
  tag: string,
  page: number = 1,
  perPage: number = 6
) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tag) {
      setArticles([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    fetch(
      `https://dev.to/api/articles?tag=${tag}&page=${page}&per_page=${perPage}`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch articles");
        return response.json();
      })
      .then((data: Article[]) => setArticles(data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [tag, page, perPage]);

  return { articles, isLoading, error };
}
