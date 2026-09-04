import type { Metadata } from "next";
import { McpPage } from "./mcp";

export const metadata: Metadata = {
  title: "MCP server - Tatak",
  description:
    "Connect an assistant to Tatak's Bengaluru transit planner over the Model Context Protocol: the endpoint, the token, and the nine read-only tools.",
};

export default function Mcp() {
  return <McpPage />;
}
