// app/utils/embedding.ts

import OpenAI from 'openai';

/**
 * Generates embedding for a given text using OpenAI's Embedding API.
 * @param text The text to generate embedding for.
 * @returns A promise that resolves to the embedding vector.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!openai.apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    console.log('Generating embedding for text:', text);

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    // Check if the response contains the expected data
    if (response.data && response.data.length > 0 && response.data[0].embedding) {
      console.log('Embedding generated successfully.');
      return response.data[0].embedding;
    } else {
      console.error('No embedding data returned from OpenAI:', response);
      throw new Error('Failed to generate embedding: No data returned.');
    }
  } catch (error: any) {
    // Log detailed error information
    if (error.response) {
      // OpenAI API returned an error response
      console.error('OpenAI API Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      // Other errors (e.g., network issues)
      console.error('Error generating embedding:', error.message || error);
    }
    throw new Error('Failed to generate embedding');
  }
}
