//mocked article data and search function
export const mockArticles = [
  {
    id: "article-001",
    title: "Welcome to Cosmos Universe",
    summary: "An introduction to Cosmos Universe.",
    tags: ["cosmos", "introduction"],
  },
  {
    id: "article-002",
    title: "CosmoPort Voyage",
    summary: "An introduction to our spacecraft simulation.",
    tags: ["voyage", "simulation"],
  },
  {
    id: "article-003",
    title: "The Universe Chronicle",
    summary: "Engineering logs, development updates, and cosmic lore.",
    tags: ["blog", "engineering"],
  },
];

export function searchArticles(query: string) {
  const normalizeQuery = query.trim().toLocaleLowerCase();

  if (!normalizeQuery) {
    return [];
  }

  return mockArticles.filter((article) => {
    const searchableText = [article.title, article.summary, ...article.tags]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizeQuery);
  });
}
