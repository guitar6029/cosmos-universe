import { z } from "zod";
import { searchArticles } from "./articles";

// defines the tool ai model is allowed to call, including input schema
type AgentId = "archivist" | "editor";

type ToolName = "search_articles" | "get_article" | "create_draft" | "publish_article";

const permissions: Record<AgentId, readonly ToolName[]> = {
  archivist: ["search_articles", "get_article"],
  editor: ["search_articles", "get_article", "create_draft"],
};

function canUseTool(agent: AgentId, tool: ToolName): boolean {
  return permissions[agent].includes(tool);
}

export const searchArticlesSchema = z.object({
  query: z.string().trim().min(1).max(120),
});

export const searchArticlesTool = {
  name: "search_articles",

  description: "Search published Cosmos Universe articles by title, summary, or tags",

  parameters: searchArticlesSchema,

  execute(input: unknown) {
    const { query } = searchArticlesSchema.parse(input);

    return searchArticles(query);
  },
};
