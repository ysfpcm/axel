This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Chat setup

Axel needs an `OPENAI_API_KEY` in `.env.local` and a knowledge base embedded
with the same model as the chat endpoint. The bundled vectors have 1,536
dimensions, while the configured `text-embedding-3-large` model returns 3,072
by default. Regenerate them before using the chat:

```bash
node --experimental-strip-types scripts/precomputeEmbeddings.ts
```

Run this from the project root with dependencies installed and Node.js 24 or
later. It calls the OpenAI API for every entry (which may incur charges) and
overwrites `data/knowledgeBaseWithEmbeddings.json` after all entries succeed.
Regenerate the vectors again if you change the embedding model; equal vector
dimensions alone do not guarantee that different models are compatible.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
