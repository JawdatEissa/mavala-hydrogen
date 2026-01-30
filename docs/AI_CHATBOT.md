# Mavala AI Beauty Assistant - Chatbot Documentation

This document describes the AI-powered chatbot feature for the Mavala Hydrogen store.

## Overview

The Mavala AI Beauty Assistant is a RAG (Retrieval Augmented Generation) chatbot that helps customers with:

- Nail care questions and tips
- Skincare advice
- Product recommendations
- Usage instructions

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Chat Widget   │────▶│    API Route    │────▶│    Supabase     │
│   (Frontend)    │     │   /api/chat     │     │   (pgvector)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │     OpenAI      │
                        │   (Embeddings   │
                        │   + Chat GPT)   │
                        └─────────────────┘
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to SQL Editor
3. Run the SQL from `scripts/setup-database.sql`
4. Copy your credentials:
   - Project URL
   - Anon Key
   - Service Role Key

### 2. Configure Environment Variables

Update `.env.local` with your credentials:

```env
# OpenAI API Key
OPENAI_API_KEY="sk-proj-..."

# Supabase Configuration
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE="your_service_role_key"
```

### 3. Ingest Content

Run the ingestion script to populate the vector database:

```bash
# Ingest all content (blogs, products, quiz data)
npm run ingest

# Or clear existing and re-ingest
npm run ingest:clear
```

### 4. Verify Setup

Check the chunk count in Supabase:

```sql
SELECT source, count(*) FROM chunks GROUP BY source;
```

Expected output:

- `blog`: ~20-50 chunks
- `product`: ~200+ chunks
- `quiz`: ~15 chunks

## File Structure

```
app/
├── components/
│   └── chat/
│       ├── ChatWidget.tsx      # Floating button + container
│       ├── ChatPanel.tsx       # Main chat interface
│       ├── MessageList.tsx     # Message display
│       ├── MessageBubble.tsx   # Individual messages
│       ├── InputBar.tsx        # Text input
│       ├── ProductCard.tsx     # Product suggestions
│       ├── TypingDots.tsx      # Loading indicator
│       ├── LoginPrompt.tsx     # Auth prompt
│       └── index.ts            # Barrel export
├── lib/
│   ├── chat.types.ts           # TypeScript types
│   ├── supabase.server.ts      # Supabase client
│   ├── openai.server.ts        # OpenAI client
│   └── auth.server.ts          # Auth utilities
└── routes/
    └── api.chat.tsx            # Chat API endpoint

scripts/
├── ingest-content.ts           # Content ingestion
└── setup-database.sql          # Database schema
```

## Features

### Semantic Search

- Uses OpenAI `text-embedding-3-small` for embeddings
- Cosine similarity search via Supabase pgvector
- Retrieves top 6 relevant content chunks

### Semantic Caching

- Caches question-answer pairs
- 90% similarity threshold for cache hits
- Reduces API calls and response time

### Product Recommendations

- Extracts product references from context
- Shows clickable product cards in responses
- Links directly to product pages

### Rate Limiting

- 20 requests per minute per user
- Uses customer ID when authenticated, IP otherwise

### Authentication (Optional)

- Ready for Shopify Customer Account API integration
- Can gate chatbot access to logged-in users
- Currently bypassed in development mode

## API Reference

### POST /api/chat

Request:

```json
{
  "question": "How do I strengthen weak nails?"
}
```

Response:

```json
{
  "answer": "To strengthen weak nails, you can...",
  "cached": false,
  "suggestedProducts": [
    {
      "handle": "mavala-scientifique",
      "title": "MAVALA SCIENTIFIQUE",
      "price": "$29.95",
      "image": "/images/mavala-scientifique/01_image.jpg",
      "category": "Nail Care"
    }
  ]
}
```

Error Response:

```json
{
  "error": "Error message here",
  "code": "AUTH_REQUIRED" // Optional error code
}
```

## Customization

### System Prompt

Edit the `SYSTEM_PROMPT` in `app/lib/openai.server.ts` to adjust the assistant's personality and behavior.

### UI Styling

The chat widget uses Tailwind CSS with Mavala's brand colors:

- Primary Red: `#E31837`
- The widget can be styled by editing components in `app/components/chat/`

### Rate Limits

Adjust in `app/lib/chat.types.ts`:

```typescript
RATE_LIMIT_WINDOW_MS: 60_000,  // 1 minute
RATE_LIMIT_MAX_CALLS: 20,      // Max calls per window
```

## Troubleshooting

### "No chunks found" or low similarity scores

1. Run `npm run ingest:clear` to re-ingest content
2. Check Supabase for chunk count
3. Verify embeddings are being generated (check console logs)

### Rate limit errors

- Wait 1 minute and try again
- Check if multiple tabs are making requests

### Authentication errors in production

- Ensure Shopify Customer Account API is configured
- Check that customer session cookies are being sent

### Supabase connection errors

1. Verify credentials in `.env.local`
2. Check that pgvector extension is enabled
3. Verify RPC functions exist (run setup SQL again)

## Performance Tips

1. **Lazy loading**: The chat widget only loads when needed
2. **Session storage**: Chat history persists per tab
3. **Semantic caching**: Frequently asked questions are cached
4. **Batch embeddings**: Ingestion processes embeddings in batches

## Future Enhancements

- [ ] Streaming responses for faster perceived performance
- [ ] Multi-turn conversation context
- [ ] Image-based product suggestions
- [ ] Voice input support
- [ ] Analytics dashboard for common questions
