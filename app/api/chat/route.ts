import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { loadKnowledgeBase } from '@/utils/knowledgeBase';
import { getEmbedding } from '@/utils/embedding';
import { cosineSimilarity } from '@/utils/similarity';

interface KnowledgeBaseItem {
  title: string;
  lastUpdated?: string;
  compatibleVersion?: string;
  contentSummary?: string;
  instructions?: string[];
  examples?: Array<{
    title: string;
    details: string;
  }>;
  notes?: string[];
  relatedTopics?: Array<{
    title: string;
    lastUpdated: string;
  }>;
  embedding: number[];
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Validate OpenAI API key
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!openai.apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key is not configured.' }), { status: 500 });
    }

    // Parse the request body
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400 });
    }

    // Validate the format of all messages
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(JSON.stringify({ error: 'Invalid message format' }), { status: 400 });
      }
    }

    // Extract the last user message
    const lastMessage = messages[messages.length - 1];

    // Load and validate the knowledge base
    const knowledgeBase: KnowledgeBaseItem[] = loadKnowledgeBase();
    const validKnowledgeBase = knowledgeBase.filter(
      (item) =>
        item.title &&
        typeof item.title === 'string' &&
        item.contentSummary &&
        typeof item.contentSummary === 'string' &&
        Array.isArray(item.embedding) &&
        item.embedding.length > 0 // Ensure embeddings are present
    );

    if (validKnowledgeBase.length === 0) {
      return new Response(JSON.stringify({ error: 'Knowledge base is empty or invalid, or embeddings not computed.' }), { status: 500 });
    }

    // Generate an embedding for the user's message
    const userEmbedding = await getEmbedding(lastMessage.content);

    // Calculate cosine similarity for each knowledge base item
    const similarities = validKnowledgeBase.map((item) =>
      cosineSimilarity(userEmbedding, item.embedding)
    );

    // Retrieve the top N relevant entries
    const TOP_N = 5;
    const topRelevantInfos = similarities
      .map((score, idx) => ({ score, item: validKnowledgeBase[idx] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
      .map(({ item }) => item);

    // Construct a context block with relevant knowledge
    const sourcesBlock = topRelevantInfos
      .map((info) => {
        const title = info.title ? `## ${info.title}` : '';
        const contentSummary = info.contentSummary ? `${info.contentSummary}\n` : '';
        
        // Format instructions if they exist
        const instructions = info.instructions
          ? `### Instructions:\n${info.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`
          : '';

        // Format examples if they exist
        const examples = info.examples
          ? `### Examples:\n${info.examples.map((ex) => `- **${ex.title}:** ${ex.details}`).join('\n')}`
          : '';

        // Format notes if they exist
        const notes = info.notes
          ? `### Notes:\n${info.notes.map(note => `- ${note}`).join('\n')}`
          : '';

        // Format related topics if they exist
        const relatedTopics = info.relatedTopics
          ? `### Related Topics:\n${info.relatedTopics.map(topic => 
              `- ${topic.title} (Last Updated: ${topic.lastUpdated})`).join('\n')}`
          : '';

        // Combine all sections, filtering out empty ones
        return [
          title,
          contentSummary,
          instructions,
          examples,
          notes,
          relatedTopics
        ].filter(Boolean).join('\n\n');
      })
      .join('\n\n---\n\n'); // Add a separator between different knowledge base entries

    // Build a user-specific prompt
    const prompt = `Below is relevant information from our internal knowledge base that may help answer the user's question:

${sourcesBlock}

User's Question: "${lastMessage.content}"

Please provide a concise and helpful response to the user's question. Use the knowledge base information to guide your answer. If your response includes steps, format them as a numbered list using Markdown syntax.
`;

    // Call the OpenAI API for a chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Use a valid model name like 'gpt-3.5-turbo' or 'gpt-4'
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'You are Axel, a friendly and professional AI assistant for Exatouch. Provide concise, easy-to-understand responses for users with minimal technical knowledge. Always base your answers on the Exatouch knowledge base. Format step-by-step instructions using Markdown numbered lists.'
        },
        // Include prior conversation context if needed
        ...messages.slice(0, -1),
        { role: 'user', content: prompt },
      ],
    });

    // Stream the OpenAI response back to the client
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('Error in chat API:', error.message || error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
