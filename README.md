# Cloudflare Workers Chat Agent

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/nexus-slacker-ai-agent-collaboration-platform)

A production-ready full-stack chat application powered by Cloudflare Workers, Durable Objects, and Agents. Features persistent chat sessions, streaming responses, tool calling, and a modern React UI with shadcn/ui components.

## Features

- **Persistent Chat Sessions**: Unlimited chat sessions stored in Durable Objects with session management (list, create, delete, rename).
- **Streaming Responses**: Real-time streaming with Server-Sent Events (SSE) for natural chat experience.
- **Tool Calling**: Built-in tools (weather, web search) + extensible MCP (Model Context Protocol) integration.
- **Multi-Model Support**: Switch between Gemini models via Cloudflare AI Gateway.
- **Modern UI**: Responsive React app with Tailwind CSS, shadcn/ui, dark mode, and sidebar navigation.
- **Session Management API**: RESTful endpoints for managing chats across devices.
- **Error Handling & Logging**: Robust error boundaries, client error reporting, and Cloudflare observability.
- **Zero-Cold-Start**: Durable Objects ensure instant responses without cold starts.

## Tech Stack

- **Backend**: Cloudflare Workers, Hono, Durable Objects (Agents SDK), OpenAI SDK
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Query, Lucide Icons
- **State Management**: Zustand, Immer
- **Tools & Utils**: SerpAPI (web search), MCP SDK, Framer Motion (animations)
- **Deployment**: Cloudflare Workers, Wrangler CLI

## Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare account with AI Gateway configured
- SerpAPI key (optional, for web search tool)

## Quick Start

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd nexus-agent-slack-xjfglz785efadahria5mf
   bun install
   ```

2. **Configure Environment**
   Edit `wrangler.jsonc`:
   ```json
   "vars": {
     "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
     "CF_AI_API_KEY": "{your-cloudflare-api-token}",
     "SERPAPI_KEY": "{your-serpapi-key}",
     "OPENROUTER_API_KEY": "{optional}"
   }
   ```
   Run `bun run cf-typegen` to generate types.

3. **Run Locally**
   ```bash
   bun run dev
   ```
   Open `http://localhost:3000`

## Development

### Scripts
| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (Vite + Worker proxy) |
| `bun run build` | Build for production |
| `bun lint` | Run ESLint |
| `bun run cf-typegen` | Generate Worker types |
| `bun run preview` | Preview production build |

### Project Structure
```
├── src/              # React frontend
├── worker/           # Cloudflare Worker backend
├── shared/           # Shared types (if needed)
├── prompts/          # AI prompts
└── wrangler.jsonc   # Worker config
```

### Customization
- **Add Routes**: Edit `worker/userRoutes.ts`
- **Extend Agent**: Modify `worker/agent.ts` and `worker/chat.ts`
- **New Tools**: Update `worker/tools.ts`
- **UI Components**: Use shadcn/ui in `src/components/ui/`
- **Sessions**: Managed via `worker/app-controller.ts`

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/:sessionId/chat` | POST | Send message (supports streaming) |
| `/api/chat/:sessionId/messages` | GET | Get chat state |
| `/api/sessions` | GET/POST/DELETE | Manage sessions |
| `/api/sessions/:id` | DELETE | Delete session |
| `/api/health` | GET | Health check |

## Deployment

1. **Build & Deploy**
   ```bash
   bun run deploy
   ```

2. **One-Click Deploy**
   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/nexus-slacker-ai-agent-collaboration-platform)

3. **Custom Domain**
   ```bash
   wrangler deploy --name my-chat-agent
   wrangler pages deploy dist --project-name my-chat-agent
   ```

4. **Environment Variables**
   Set via Wrangler dashboard or CLI:
   ```bash
   wrangler secret put CF_AI_API_KEY
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CF_AI_BASE_URL` | Yes | Cloudflare AI Gateway URL |
| `CF_AI_API_KEY` | Yes | API token for AI Gateway |
| `SERPAPI_KEY` | No | SerpAPI key for web search |
| `OPENROUTER_API_KEY` | No | OpenRouter API key |

## Troubleshooting

- **CORS Issues**: All API routes have CORS enabled.
- **Durable Objects**: Ensure migrations run on first deploy.
- **Type Errors**: Run `bun run cf-typegen`.
- **AI Gateway**: Verify `@cf/meta/llama-3.1-70b-instruct` or Gemini models.

## Contributing

1. Fork & clone
2. `bun install`
3. Create feature branch
4. Submit PR to `main`

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built with ❤️ for Cloudflare Workers. Questions? [Cloudflare Docs](https://developers.cloudflare.com/workers/)