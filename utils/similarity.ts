// utils/similarity.ts

export const cosineSimilarity = (a: number[], b: number[]): number => {
    if (a.length === 0 || a.length !== b.length) {
        throw new Error('Embedding vectors must have the same non-zero dimension.');
    }

    const dotProduct = a.reduce((sum, val, idx) => sum + val * b[idx], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
    return dotProduct / (magnitudeA * magnitudeB);
};
