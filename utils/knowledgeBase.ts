// app/utils/knowledgeBase.ts
import knowledgeBase from '@/data/knowledgeBase.json';

interface KnowledgeItem {
  title: string;
  content: string;
  url: string;
  embedding: number[];
}

export function loadKnowledgeBase(): KnowledgeItem[] {
  return knowledgeBase as unknown as KnowledgeItem[];
}
