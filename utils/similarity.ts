// utils/similarity.ts

export const cosineSimilarity = (a: number[], b: number[]): number => {
    if (a.length === 0 || a.length !== b.length) {
        throw new Error('Embedding vectors must have the same non-zero dimension.');
    }

    const scaleA = a.reduce((maximum, value) => Math.max(maximum, Math.abs(value)), 0);
    const scaleB = b.reduce((maximum, value) => Math.max(maximum, Math.abs(value)), 0);

    if (scaleA === 0 || scaleB === 0) return 0;

    const scaledA = a.map((value) => value / scaleA);
    const scaledB = b.map((value) => value / scaleB);
    const dotProduct = scaledA.reduce((sum, value, index) => sum + value * scaledB[index], 0);
    const magnitudeA = Math.sqrt(scaledA.reduce((sum, value) => sum + value * value, 0));
    const magnitudeB = Math.sqrt(scaledB.reduce((sum, value) => sum + value * value, 0));

    return dotProduct / (magnitudeA * magnitudeB);
};
