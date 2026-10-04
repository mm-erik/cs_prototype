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
  lookup-form.tsx                       the Lookup input
  conversations/[conversationId]/
    page.tsx                            per-Conversation route and its failure states
    conversation-header.tsx             Tenant, Conversation ID, start time, count, status
    copy-transcript-button.tsx          'use client' — puts the Transcript on the clipboard
    transcript.tsx                      the Transcript, gap markers, Empty Conversation
    message-bubble.tsx                  one Message as a chat bubble
    message-content.tsx                 the only component that knows content is Markdown
    gap-marker.tsx                      the "N minutes later" separator
    format-time.ts                      one UTC formatter, shared by header and Messages

src/conversation/                       the domain and the seam, meant to outlive the rest
```

One action copies the whole Transcript as Markdown, with the author labels intact, so the
End User and the Bot stay distinguishable once the text is pasted into a ticket. The
Markdown source is copied rather than the rendered output, because tickets are usually
Markdown-aware.

Message content renders as Markdown with raw HTML disabled. "Verbatim" in this project
means nothing an End User typed is masked or redacted; it does not mean executing markup
that arrives in a Transcript, so HTML in a Message is shown as text rather than run.

Tests live beside the code they cover as `*.test.ts`. Per `CLAUDE.md` only
`lookupConversation` is tested, driven by a fake `ConversationStore`. Those tests double as
the specification the eventual database-backed store must satisfy. The user interface is
deliberately never tested.

## Fixture Conversation IDs

Paste these into the Lookup input to reach each outcome by hand. Every value is synthetic,
because this repository is public. They all live in
`src/conversation/mock-conversation-store.ts`, the two reserved ones as named constants.

| Conversation ID                             | What it exercises                             |
| -------------------------------------------- | --------------------------------------------- |
| `conv_00000000-0000-4000-8000-000000000001`  | A short, ordinary exchange                     |
| `conv_00000000-0000-4000-8000-000000000002`  | A long Conversation, around sixty Messages     |
| `conv_00000000-0000-4000-8000-000000000003`  | A Markdown-heavy Bot answer: table, list, code block, links — and literal HTML shown as text |
| `conv_00000000-0000-4000-8000-000000000004`  | A long pause, so the gap marker appears        |
| `conv_00000000-0000-4000-8000-000000000005`  | An Empty Conversation, which explains itself   |
| `conv_00000000-0000-4000-8000-000000000006`  | An In-Progress Conversation, labelled as still ongoing |
| `conv_00000000-0000-4000-8000-0000000000ff`  | Unknown Conversation — reserved, never exists  |
| `conv_00000000-0000-4000-8000-0000000000fe`  | Unavailable — reserved, the store throws       |

Anything that is not a `conv_` prefix followed by a UUID is a Malformed Conversation ID, so
pasting a ticket number reaches that state.

The input forgives how a Conversation ID is actually pasted: surrounding whitespace,
surrounding quotes, and a full URL to a Conversation all resolve to the same Lookup.
