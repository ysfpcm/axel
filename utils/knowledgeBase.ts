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
    return JSON.parse(knowledgeBaseData);
  } catch (error) {
    console.error("Error loading knowledge base:", error);
    return []; // Return an empty array in case of an error
  }
};
