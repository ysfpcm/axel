// app/api/chat/route.ts

import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { loadKnowledgeBase } from '@/utils/knowledgeBase';
import { getEmbedding } from '@/utils/embedding';
import { cosineSimilarity } from '@/utils/similarity';

export const runtime = 'edge';

export async function POST(req: Request): Promise<Response> {
  try {
    // Initialize OpenAI client within the handler
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!openai.apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    // Parse the request body
    const body = await req.json();
    console.log('Request body:', body);
    const { messages } = body;

    // Validate the messages array
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (messages.length === 0) {
      console.error('No messages received.');
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate each message
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.role || !msg.content) {
        console.error(`Message at index ${i} is invalid:`, msg);
        return new Response(JSON.stringify({ error: `Invalid message format at index ${i}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({ error: 'Knowledge base error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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

    // Construct a more informative prompt
    const prompt = `Based on the following relevant information:
${combinedInfo}

Please provide a concise and helpful response to the user's question: "${lastMessage.content}"
If your response includes steps, format them as a numbered list using Markdown syntax.`;

    console.log('Constructed prompt:', prompt);

    // Create the chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Corrected model name
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'You are Axel, a friendly and professional AI assistant for Exatouch. Provide brief, easy-to-understand responses for individuals with no technical knowledge. Use the given context to inform your answers, and when providing step-by-step instructions, format them as a numbered list using Markdown syntax.',
        },
        ...messages.slice(0, -1),
        { role: 'user', content: prompt },
      ],
    });

    console.log('OpenAI API response received');

    // Stream the response
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
