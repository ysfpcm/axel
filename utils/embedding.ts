// app/utils/embedding.ts

import { OpenAIApi, Configuration } from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

/**
 * Generates embedding for a given text using OpenAI's Embedding API.
 * @param text The text to generate embedding for.
 * @returns A promise that resolves to the embedding vector.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: text,
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.data[0].embedding;
}
