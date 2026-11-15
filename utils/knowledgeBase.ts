// utils/knowledgeBase.ts
import fs from 'fs';
import path from 'path';

interface KnowledgeBaseEntry {
  title: string;
  content: string;
  embedding: number[];
}

export const loadKnowledgeBase = (): KnowledgeBaseEntry[] => {
  try {
    const knowledgeBasePath = path.join(process.cwd(), 'data', 'knowledgeBaseWithEmbeddings.json');
    const knowledgeBaseData = fs.readFileSync(knowledgeBasePath, 'utf8');
    const parsed: unknown = JSON.parse(knowledgeBaseData);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item !== null && typeof item === 'object' && !Array.isArray(item));
  } catch (error) {
    console.error("Error loading knowledge base:", error);
    return []; // Return an empty array in case of an error
  }
};
