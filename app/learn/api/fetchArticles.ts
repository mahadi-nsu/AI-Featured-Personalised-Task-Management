import type { Article } from "../static/articleTypes";

export async function fetchArticlesByTag(
  tag: string,
  page: number = 1,
  perPage: number = 6
): Promise<Article[]> {
  if (!tag) return [];
  const response = await fetch(
    `https://dev.to/api/articles?tag=${tag}&page=${page}&per_page=${perPage}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }
  return response.json();
}
