import * as dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Path to the knowledge base JSON file
const knowledgeBasePath = path.join(process.cwd(), "data", "knowledgeBaseWithEmbeddings.json");

export function loadKnowledgeBase() {
  if (!fs.existsSync(knowledgeBasePath)) {
    throw new Error(`Knowledge base file not found at path: ${knowledgeBasePath}`);
  }

  const knowledgeBaseData = fs.readFileSync(knowledgeBasePath, "utf8");
  return JSON.parse(knowledgeBaseData) as KnowledgeItem[];
}

// Interface for a knowledge base item
interface KnowledgeItem {
  title: string;
  lastUpdated?: string;
  compatibleVersion?: string;
  contentSummary?: string;
  instructions?: string[];
  examples?: { title: string; details: string }[];
  notes?: string[];
  relatedTopics?: { title: string; lastUpdated: string }[];
  url?: string;
  embedding?: number[];
  promoSettings?: { field: string; description: string }[];
}

/**
 * Constructs a string payload for embedding generation by combining relevant fields of a knowledge base item.
 * @param item The KnowledgeItem to process.
 * @returns A concatenated string of relevant fields.
 */
function buildEmbeddingText(item: KnowledgeItem): string {
  const parts: string[] = [];

  if (item.title) parts.push(`Title: ${item.title}`);
  if (item.contentSummary) parts.push(`Content Summary: ${item.contentSummary}`);
  if (item.instructions?.length)
    parts.push(
      `Instructions:\n${item.instructions.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}`
    );
  if (item.examples?.length)
    parts.push(
      `Examples:\n${item.examples.map((ex) => `- ${ex.title}: ${ex.details}`).join("\n")}`
    );
  if (item.notes?.length)
    parts.push(`Notes:\n${item.notes.map((note) => `- ${note}`).join("\n")}`);
  if (item.relatedTopics?.length)
    parts.push(
      `Related Topics:\n${item.relatedTopics
        .map((topic) => `- ${topic.title} (Last Updated: ${topic.lastUpdated})`)
        .join("\n")}`
    );

  return parts.join("\n\n").trim();
}

/**
 * Generates an embedding for a given text using OpenAI's Embedding API.
 * @param openai An instance of the OpenAI class.
 * @param text The text to generate an embedding for.
 * @returns A promise that resolves to the embedding vector.
 */
async function getEmbedding(openai: OpenAI, text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });

    if (response.data && response.data.length > 0) {
      return response.data[0].embedding;
    } else {
      throw new Error("No embedding data returned.");
    }
  } catch (error: any) {
    console.error("Error generating embedding:", error.message || error);
    throw new Error("Failed to generate embedding.");
  }
}

/**
 * Precomputes embeddings for all knowledge base items and saves the updated data back to the JSON file.
 */
async function precomputeEmbeddings() {
  try {
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in the environment variables.");
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Ensure the knowledge base file exists
    if (!fs.existsSync(knowledgeBasePath)) {
      throw new Error(`Knowledge base file not found: ${knowledgeBasePath}`);
    }

    // Load and parse the knowledge base
    const knowledgeBaseData = fs.readFileSync(knowledgeBasePath, "utf8");
    const knowledgeBase: KnowledgeItem[] = JSON.parse(knowledgeBaseData);

    if (!Array.isArray(knowledgeBase) || knowledgeBase.length === 0) {
      throw new Error("Knowledge base is empty or invalid.");
    }

    console.log("Loaded Knowledge Base:", knowledgeBase);

    const updatedKnowledgeBase: KnowledgeItem[] = [];

    for (const item of knowledgeBase) {
      try {
        const textForEmbedding = buildEmbeddingText(item);
        console.log(`Embedding text for "${item.title}":`, textForEmbedding);

        if (!textForEmbedding.trim()) {
          console.warn(`Skipping item with no meaningful content: ${item.title}`);
          continue;
        }

        const embedding = await getEmbedding(openai, textForEmbedding);
        updatedKnowledgeBase.push({ ...item, embedding });
        console.log(`Generated embedding for: ${item.title}`);
      } catch (error: any) {
        console.error(`Error generating embedding for "${item.title}":`, error.message || error);
      }
    }

// Save updated knowledge base
fs.writeFileSync(
  knowledgeBasePath,
  JSON.stringify(updatedKnowledgeBase, (key, value) => {
    // Keep embeddings in a single line
    if (key === "embedding" && Array.isArray(value)) {
      return JSON.stringify(value); // Temporarily stringify the array
    }
    return value;
  }, 2)
    .replace(/"(\[.*?\])"/g, '$1'), // Remove quotes around stringified arrays
      "utf8"
    );
    console.log("Precomputed embeddings saved to knowledgeBaseWithEmbeddings.json.");
  } catch (error: any) {
    console.error("Error during embedding precomputation:", error.message || error);
  }
}

// Execute embedding precomputation
precomputeEmbeddings();
