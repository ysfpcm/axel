// pages/api/chat.ts

import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { loadKnowledgeBase } from '@/utils/knowledgeBase';
import { getEmbedding } from '@/utils/embedding';
import { cosineSimilarity } from '@/utils/similarity';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req: Request): Promise<Response> {
  try {
    // Parse the request body
    const body = await req.json();
    console.log('Request body:', body);
    const { messages } = body;

    // Validate the messages array
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return new Response('Invalid messages format', { status: 400 });
    }

    if (messages.length === 0) {
      console.error('No messages received.');
      return new Response('No messages provided', { status: 400 });
    }

    // Validate each message
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.role || !msg.content) {
        console.error(`Message at index ${i} is invalid:`, msg);
        return new Response(`Invalid message format at index ${i}`, { status: 400 });
      }
    }

    const lastMessage = messages[messages.length - 1];
    console.log('Last message:', lastMessage);
    // Load the knowledge base with embeddings
    const knowledgeBase = loadKnowledgeBase();
    console.log('Loaded knowledgeBase with embeddings:', knowledgeBase.length, 'entries');

    // Validate knowledgeBase structure
    const validKnowledgeBase = knowledgeBase.filter(
      (item) =>
        item.title &&
        typeof item.title === 'string' &&
        item.content &&
        typeof item.content === 'string' &&
        Array.isArray(item.embedding)
    );

    if (validKnowledgeBase.length === 0) {
      console.error('Knowledge base is empty or improperly formatted.');
      return new Response('Knowledge base error', { status: 500 });
    }

    // Generate embedding for user message
    const userEmbedding = await getEmbedding(lastMessage.content);
    console.log('User embedding generated.');

    // Calculate similarity scores
    const similarities = validKnowledgeBase.map((item) =>
      cosineSimilarity(userEmbedding, item.embedding)
    );

    // Find top N relevant entries
    const TOP_N = 5;
    const topIndices = similarities
      .map((score, idx) => ({ score, idx }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
      .map((item) => item.idx);

    const topRelevantInfos = topIndices.map((idx) => validKnowledgeBase[idx].content);
    const combinedInfo = topRelevantInfos.join(' ');
    console.log(`Top ${TOP_N} relevant infos combined.`);

    // Construct the prompt with enhanced instructions
    const prompt = combinedInfo
      ? `Based on the following information: "${combinedInfo}", please provide a response to: "${lastMessage.content}". If your response includes steps, format them as a numbered list using Markdown syntax.`
      : `${lastMessage.content}. If your response includes steps, format them as a numbered list using Markdown syntax.`;

    console.log('Constructed prompt:', prompt);

    // Create the chat completion
    const response = await openai.createChatCompletion({
      model: 'gpt-4', // Corrected model name
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly and professional AI assistant. All of your responses must be brief and easy to understand for individuals with no technical knowledge. When providing step-by-step instructions, format them as a numbered list using Markdown syntax.',
        },
        ...messages.slice(0, -1),
        { role: 'user', content: prompt },
      ],
    });

    console.log('OpenAI API response status:', response.status);

    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response('OpenAI API error', { status: 500 });
    }

    // Stream the response
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('An error occurred', { status: 500 });
  }
}
