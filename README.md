# cs_prototype

A read-only internal viewer for SaaS chatbot Conversations. A Support Agent is handed a
Conversation ID, pastes it in, and reads the Transcript.

Start with [`CLAUDE.md`](CLAUDE.md) for the architecture and the closed decisions,
[`CONTEXT.md`](CONTEXT.md) for the domain glossary, and
[`docs/spec-conversation-viewer.md`](docs/spec-conversation-viewer.md) for the full
reasoning.

## Commands

Install once with `npm install`, then:

| Command             | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | Dev server on <http://localhost:3000>                          |
| `npm test`          | Vitest, single run                                             |
| `npm run test:watch`| Vitest in watch mode                                           |
| `npm run build`     | Production build                                               |
| `npm start`         | Serve the production build (needs `npm run build` first)       |
| `npm run typecheck` | `tsc --noEmit`                                                 |

## Routes

| Route                            | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `/`                              | Landing route, which will carry the Lookup input      |
| `/conversations/[conversationId]`| One Conversation, keyed by its Conversation ID        |

Both render placeholders today. The Lookup and the Transcript arrive in the next ticket.

## Toolchain

Next.js (App Router), React, TypeScript in strict mode, Tailwind CSS, Vitest.

Next.js was chosen for its server boundary. The real data source will be a database the
browser must never reach, so the Lookup runs server-side from the first commit and
replacing mock data with a real `ConversationStore` later never touches the client.

Tailwind 4 is configured from CSS: the single `@import "tailwindcss"` in
`src/app/globals.css` is the whole setup, and there is no `tailwind.config` file.

Vitest is held at 4.x deliberately. Vitest 5 requires Node 22.12 or newer, and this project
builds on Node 20; the `^4` range cannot resolve to 5, so the constraint holds on its own.
`package.json` declares `engines.node >= 20.9.0`, which is what Next.js 16 requires.

## Layout

```
src/app/
  layout.tsx                            root layout and the page shell
  globals.css                           Tailwind entry point
  page.tsx                              landing route
  conversations/[conversationId]/
    page.tsx                            per-Conversation route
```

Tests live beside the code they cover as `*.test.ts`. There are none yet: per `CLAUDE.md`
only `lookupConversation` is tested, and it arrives in the next ticket, so Vitest is
configured with `passWithNoTests` and `npm test` passes against an empty suite. The user
interface is deliberately never tested.
