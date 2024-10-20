// scripts/precomputeEmbeddings.ts

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Load the original knowledge base
const knowledgeBasePath = path.join(process.cwd(), 'data', 'knowledgeBase.json');
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));

interface KnowledgeItem {
  title: string;
  content: string;
  url: string;
  embedding?: number[]; // Optional, will be added
}

/**
 * Generates embedding for a given text using OpenAI's Embedding API.
 * @param text The text to generate embedding for.
 * @returns A promise that resolves to the embedding vector.
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!openai.apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    if (response.data && response.data.length > 0 && response.data[0].embedding) {
      return response.data[0].embedding;
    } else {
      console.error('No embedding data returned from OpenAI:', response);
      throw new Error('Failed to generate embedding: No data returned.');
    }
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

async function precomputeEmbeddings() {
  const updatedKnowledgeBase: KnowledgeItem[] = [];

  for (const item of knowledgeBase) {
    try {
      const embedding = await getEmbedding(item.content);
      updatedKnowledgeBase.push({ ...item, embedding });
      console.log(`Generated embedding for: ${item.title}`);
    } catch (error) {
      console.error(`Error generating embedding for ${item.title}:`, error);
    }
  }

  // Save the updated knowledge base with embeddings
  const updatedPath = path.join(process.cwd(), 'data', 'knowledgeBaseWithEmbeddings.json');
  fs.writeFileSync(updatedPath, JSON.stringify(updatedKnowledgeBase, null, 2), 'utf8');
  console.log('Precomputed embeddings and saved to knowledgeBaseWithEmbeddings.json');
}

precomputeEmbeddings();
