// utils/knowledgeBase.ts

interface KnowledgeBaseEntry {
  title: string;
  content: string;
  embedding: number[];
}

export const loadKnowledgeBase = (): KnowledgeBaseEntry[] => {
  // Example: Load from a JSON file or database
  // Here, we'll return a static array for demonstration
  return [
    {
      title: 'Example Title',
      content: 'Example content.',
      embedding: [/* embedding numbers */],
    },
    // Add more entries as needed
  ];
};
